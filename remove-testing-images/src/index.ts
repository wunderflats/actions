import * as github from "@actions/github";
import * as core from "@actions/core";
import { parseISO, isBefore, subMonths } from "date-fns";

const token = core.getInput("GITHUB_TOKEN", { required: true });
const packageName = core.getInput("PACKAGE_NAME", { required: true });
const bulkCleanupInput = core.getInput("BULK_CLEANUP", { required: true });
const tag = core.getInput("TAG");

const octokit = github.getOctokit(token);
const bulkCleanup = bulkCleanupInput === "true";

await run();

async function run() {
  const acceptedPackageNames = [
    "api-testing",
    "website-testing",
    "crm-testing",
    "lld-testing",
  ];

  if (!acceptedPackageNames.includes(packageName)) {
    core.setFailed(`package name ${packageName} is not supported.`);
    return;
  }

  try {
    if (bulkCleanup && tag) {
      throw new Error(
        "Single image removal and bulk cleanup cannot be done together."
      );
    }

    if (tag) {
      const testingImageId = await findTestingImageByTag();

      if (!testingImageId) {
        throw new Error(`No testing image found with tag ${tag}`);
      }

      return removeTestingImage(testingImageId);
    }

    if (bulkCleanup) {
      await cleanupUnneededTestingImages();
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function findTestingImageByTag() {
  core.info(`🔦 looking for testing image with tag ${tag}...`);

  let imagesWithRequestedTag: number | undefined;

  await octokit.paginate(
    octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg,
    {
      package_type: "container",
      state: "active",
      package_name: packageName,
      org: "wunderflats",
      per_page: 100,
    },
    (response, done) => {
      const testingImages = response.data;
      const targetImage = testingImages.find((v) =>
        v.metadata.container.tags.includes(tag)
      );

      if (targetImage) {
        imagesWithRequestedTag = targetImage.id;
        done();
      }

      return response.data;
    }
  );

  return imagesWithRequestedTag;
}

async function cleanupUnneededTestingImages() {
  core.info("🔦 finding the unneeded images to cleanup...");
  const imagesToBeDeleted: number[] = [];

  for await (const response of octokit.paginate.iterator(
    octokit.rest.packages.getAllPackageVersionsForPackageOwnedByOrg,
    {
      package_type: "container",
      package_name: packageName,
      org: "wunderflats",
      state: "active",
      per_page: 100,
    }
  )) {
    const testingImages = response.data;
    for (const image of testingImages) {
      const imageTags = image.metadata.container.tags;

      const isUnnecessaryImageWithHashTag =
        imageTags.length === 1 &&
        imageTags[0].length === 40 &&
        /^[A-F0-9]+$/i.test(imageTags[0]); // Hexadecimal check

      const isOldImage = isBefore(
        parseISO(image.created_at),
        subMonths(new Date(), 3)
      );

      if (
        imageTags.length == 0 ||
        isUnnecessaryImageWithHashTag ||
        isOldImage
      ) {
        imagesToBeDeleted.push(image.id);
      }
    }
  }

  if (imagesToBeDeleted.length === 0) {
    core.info("🎉 no unneeded images found.");
    return;
  }

  core.startGroup(
    `🧹 starting the cleanup of ${imagesToBeDeleted.length} testing images`
  );

  for (const imageId of imagesToBeDeleted) {
    await removeTestingImage(imageId);
  }

  core.endGroup();
}

async function removeTestingImage(imageId) {
  core.info(`⏳ image with id ${imageId} is about to be deleted...`);

  try {
    // await octokit.rest.packages.deletePackageVersionForOrg({
    //   package_type: "container",
    //   package_name: packageName,
    //   org: "wunderflats",
    //   package_version_id: imageId,
    // });

    core.info(`✅ image with id ${imageId} deleted.`);
  } catch (error) {
    throw new Error(`package #${imageId} not deleted: ${error.message}`);
  }
}
