	DELIMITER $$
	CREATE PROCEDURE `sp_GetGlobalCodePermission`(
		IN id INT,
		IN deletedby VARCHAR(50)
	)
	BEGIN
		
	   SELECT * from globalcodecategories as gcc			join globalcodes as gc on gcc.GlobalCodeCategoryId = gc.GlobalCodeCategoryId			LEFT join permissions as p on gc.GlobalCodeId = p.GlobalCodePermissionId			where gcc.CategoryName = "Permissions" and gcc.IsActive = true			and gcc.IsDeleted = false and gc.IsActive = true and gc.IsDeleted = false;
	
	END$$
	DELIMITER ;
	
