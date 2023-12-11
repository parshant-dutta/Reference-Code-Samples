CREATE TABLE IdentityRole(
	`Id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`Name` varchar(50) NULL,
	`OrderBy` int NULL,
	`LastModifiedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`LastModifiedBy` varchar(50) NULL,
	`CreatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`CreatedBy` varchar(50) NULL
	)
