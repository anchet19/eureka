CREATE DEFINER=`administrator`@`localhost` PROCEDURE `insertBusiness`(name varchar(255), address varchar(255), lat float, `long` float, menu varchar(255), cuisine varchar(45), description varchar(1000), isAdult tinyint(4), owner_id int(11))
begin
	INSERT INTO businesses(name, address, lat, `long`, menu, cuisine, description, isAdult, owner_id) values ( name, address, lat, `long`, menu, cuisine, description, isAdult, owner_id);
   end