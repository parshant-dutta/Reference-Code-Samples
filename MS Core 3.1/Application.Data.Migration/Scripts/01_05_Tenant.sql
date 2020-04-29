CREATE TABLE Tenants(
	`Id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
	`APIKey` varchar(36) NOT NULL,
	`EIN` varchar(10) NULL,
	`Name` varchar(50) NULL,
	`TimeZone` varchar(10) NULL,
	`URL` varchar(200) NULL,
	`LastModifiedAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`LastModifiedBy` varchar(50) NULL,
	`CreatedAt` datetime(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`CreatedBy` varchar(50) NULL
	)



