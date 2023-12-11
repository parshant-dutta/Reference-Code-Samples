	CREATE TABLE TenantHost(
		`Id` int PRIMARY KEY AUTO_INCREMENT NOT NULL,
		`TenantId` int NOT NULL,
		`Name` varchar(100) NULL,
		`LastModifiedAt` datetime(3) DEFAULT CURRENT_TIMESTAMP,
		`LastModifiedBy` varchar(50) NULL,
		`CreatedAt` datetime(3) DEFAULT CURRENT_TIMESTAMP,
		`CreatedBy` varchar(50) NULL
		)
		
	

 


