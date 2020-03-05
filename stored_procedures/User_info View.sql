CREATE 
    ALGORITHM = UNDEFINED 
    DEFINER = `administrator`@`localhost` 
    SQL SECURITY DEFINER
VIEW `business_discovery`.`User_info` AS
    (SELECT 
        CONCAT(`c`.`first_name`, ' ', `c`.`last_name`) AS `Name`,
        `u`.`email` AS `email`,
        `c`.`dob` AS `dob`
    FROM
        (`business_discovery`.`users` `u`
        JOIN `business_discovery`.`consumers` `c` ON ((`u`.`user_id` = `c`.`user_id`))))