DELIMITER $$
CREATE PROCEDURE `sp_UpdatActiveStaus`(
    IN tablename VARCHAR(100),
    IN active bit,
    IN id INT,
    IN modifiedby VARCHAR(50)
)
BEGIN
DECLARE result bit DEFAULT 0;
    CASE WHEN
        tablename = 'Segments' THEN
    UPDATE
        Segments
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
        SegmentId = id;

		WHEN
        tablename = 'JobTypes' THEN
    UPDATE
        JobTypes
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
        JobTypeId = id;
		WHEN
        tablename = 'MachineTypes' THEN
    UPDATE
        MachineTypes
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
        MachineTypeId = id;
		WHEN
        tablename = 'Parts' THEN
    UPDATE
        Parts
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
        PartId = id;
		WHEN
        tablename = 'Machines' THEN
    UPDATE
        Machines
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
        MachineId = id;
		WHEN
        tablename = 'GlobalCodeCategories' THEN
    UPDATE
        GlobalCodeCategories
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
        GlobalCodeCategoryId = id;
	WHEN
        tablename = 'GlobalCodes' THEN
    UPDATE
        GlobalCodes
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
	GlobalCodeId = id;
	WHEN
        tablename = 'Roles' THEN
    UPDATE
        Roles
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
       RoleId = id;
	   WHEN
        tablename = 'Users' THEN
    UPDATE
        Users
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
       UserId = id;
        WHEN
        tablename = 'Clients' THEN
    UPDATE
        Clients
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
       ClientId = id;
	    WHEN
        tablename = 'Attributes' THEN
    UPDATE
        Attributes
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
       AttributeId = id;
	    WHEN
        tablename = 'Templates' THEN
    UPDATE
        Templates
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
       TemplateId = id;
	   WHEN
        tablename = 'Inventorys' THEN
    UPDATE
        Inventorys
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
       StockId = id;
	      WHEN
	    tablename = 'Permissions' THEN
    UPDATE
        Permissions
    SET
        IsActive = active,
        ModifiedBy = modifiedby,
        ModifiedOn = NOW()
    WHERE
       StockId = id;
        
        END CASE;
		IF (Select ROW_COUNT() > 0)
        THEN
           set result = 1;
        END IF;
		Select result as result;
END$$
DELIMITER ;