-- CreateTable
CREATE TABLE IF NOT EXISTS \"SiteSettings\" (
    \"id\" TEXT NOT NULL DEFAULT 'singleton',
    \"data\" JSONB NOT NULL,
    \"updatedAt\" TIMESTAMP(3) NOT NULL,
    CONSTRAINT \"SiteSettings_pkey\" PRIMARY KEY (\"id\")
);
