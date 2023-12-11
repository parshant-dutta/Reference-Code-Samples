
CREATE TABLE IdentityUser(
	`Id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`APIKey` Char(36) NOT NULL,
	`Username` varchar(50) NULL,
	`FirstName` varchar(50) NULL,
	`LastName` varchar(50) NULL,
	`PasswordHash` varchar(100) NULL,
	`IsEmailConfirmed` Tinyint NOT NULL DEFAULT 0,
	`IsLockoutEnabled` Tinyint NOT NULL DEFAULT 0,
	`AccessFailedCount` smallint NOT NULL DEFAULT 0,
	`LockoutEnd` datetime(3) NULL,
	`LastModifiedAt` datetime(3) NOT NULL   DEFAULT CURRENT_TIMESTAMP,
	`LastModifiedBy` varchar(50) NULL,
	`CreatedAt` datetime(3) NOT NULL   DEFAULT CURRENT_TIMESTAMP,
	`CreatedBy` varchar(50) NULL
	)
