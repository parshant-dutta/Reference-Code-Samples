	DELIMITER $$
	CREATE PROCEDURE `sp_DeleteRecord`(
		IN tablename VARCHAR(100),
		IN id INT,
		IN deletedby VARCHAR(50)
	)
	BEGIN
		DECLARE result bit DEFAULT 0;
		CASE WHEN
			tablename = 'Segments' THEN
		UPDATE
			Segments
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			SegmentId = id;
			WHEN
			tablename = 'JobTypes' THEN
		UPDATE
			JobTypes
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			JobTypeId = id;
			WHEN
			tablename = 'MachineTypes' THEN
			UPDATE
			MachineTypes
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			MachineTypeId = id;
				WHEN
			tablename = 'Parts' THEN
			UPDATE
			Parts
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			PartId = id;
			WHEN
			tablename = 'Machines' THEN
			UPDATE
			Machines
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			MachineId = id;
			WHEN
			tablename = 'GlobalCodeCategory' THEN
		UPDATE
			GlobalCodeCategories
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			GlobalCodeCategoryId = id;
			WHEN
			tablename = 'GlobalCodes' THEN
		UPDATE
			GlobalCodes
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			GlobalCodeId = id;
			WHEN
			tablename = 'Roles' THEN
		UPDATE
			Roles
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			RoleId = id;
			WHEN
			tablename = 'Users' THEN
		UPDATE
			Users
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			UserId = id;
			WHEN
			tablename = 'Clients' THEN
		UPDATE
			Clients
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			ClientId = id;
			WHEN
			tablename = 'ObjectAttributes' THEN
		UPDATE
			ObjectAttributes
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			ObjectAttributeId = id;
			
		UPDATE
			Attributes
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			AttributeId = (SELECT AttributeId FROM ObjectAttributes WHERE ObjectAttributeId = id);
			WHEN
			tablename = 'Templates' THEN
		UPDATE
			Templates
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			TemplateId = id;
		WHEN
			tablename = 'attributescollections' THEN
		UPDATE
			attributescollections
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			AttributeCollectionId = id;

			WHEN
			tablename = 'Inventorys' THEN
		UPDATE
			Inventorys
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			StockId = id;
			WHEN
			tablename = 'Permissions' THEN
		UPDATE
			Permissions
		SET
			IsDeleted = 1,
			DeletedBy = deletedby,
			DeletedOn = NOW()
		WHERE
			RolePermissionId = id;
			END CASE;
			
			IF (Select ROW_COUNT() > 0)
			THEN
			   set result = 1;
			END IF;
	   Select result as result;
	END$$
	DELIMITER ;
