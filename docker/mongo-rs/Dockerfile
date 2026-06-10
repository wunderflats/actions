FROM mongo:8.0

# Bake replica-set mode into the default command so consumers can use this
# image directly as a GitHub Actions `services:` container. The services
# block has no `command:` field, so flags must live in the image itself.
CMD ["mongod", "--replSet", "rs", "--bind_ip_all"]
