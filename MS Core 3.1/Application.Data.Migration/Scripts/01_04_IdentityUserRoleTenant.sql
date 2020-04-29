CREATE TABLE IdentityUserRoleTenant(
	`UserId` int PRIMARY KEY NOT NULL,
	`RoleId` int NOT NULL,
	`TenantId` int NOT NULL,
	`LastModifiedAt` datetime(3) NOT NULL  DEFAULT CURRENT_TIMESTAMP,
	`LastModifiedBy` varchar(50) NULL,
	`CreatedAt` datetime(3) NOT NULL  DEFAULT CURRENT_TIMESTAMP,
	`CreatedBy` varchar(50) NULL
	)
