# Pinned to 8.0.32 + digest: mongo:8.0 (floating tag) crashes ~60s after start
# on Linux kernel 6.19 through 7.0.13 due to a TCMalloc/rseq incompatibility,
# causing a restart loop under Docker/GitHub Actions runners. Bump this
# tag+digest deliberately, not via the floating tag.
FROM mongo:8.0.32@sha256:6c108efd306c66a7eb58e0b4042c2fcffb4a4980dac111039c59fd714db6a69b

# Bake replica-set mode into the default command so consumers can use this
# image directly as a GitHub Actions `services:` container. The services
# block has no `command:` field, so flags must live in the image itself.
CMD ["mongod", "--replSet", "rs", "--bind_ip_all"]
