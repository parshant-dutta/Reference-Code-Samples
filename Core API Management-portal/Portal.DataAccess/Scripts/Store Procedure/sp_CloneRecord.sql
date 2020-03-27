	DELIMITER $$
	CREATE PROCEDURE `sp_CloneRecord`(
		IN tablename VARCHAR(100),
		IN id INT,
		IN createdby VARCHAR(50)
	)
	BEGIN
		DECLARE result bit DEFAULT 0;
		CASE WHEN
			tablename = 'Templates' THEN
			
				INSERT INTO templates (IsActive, CreatedBy, CreatedOn, IsDeleted, Machine, MachineType,Segment,SegmentType,TemplateType,TemplateCode,TemplateName,Description)
				SELECT IsActive, createdby, NOW(), 0, Machine, MachineType,Segment,SegmentType,TemplateType,TemplateCode,TemplateName,Description FROM Templates WHERE TemplateId=id;			
			
			END CASE;			
			IF (Select ROW_COUNT() > 0)
			THEN
			   set result = 1;
			END IF;
	   Select result as result;
	END$$
	DELIMITER ;
