ALTER TABLE `FIPOP`.`category_set_has_category` DROP FOREIGN KEY `fk_category_set_has_category_category_set1`; 
ALTER TABLE `FIPOP`.`category_set_has_category` ADD CONSTRAINT `fk_category_set_has_category_category_set1` FOREIGN KEY (`category_set_id`) REFERENCES `FIPOP`.`category_set` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION; 
ALTER TABLE `FIPOP`.`category_set_has_category` DROP FOREIGN KEY `fk_category_set_has_category_category1`; 
ALTER TABLE `FIPOP`.`category_set_has_category` ADD CONSTRAINT `fk_category_set_has_category_category1` FOREIGN KEY (`category_id`) REFERENCES `FIPOP`.`category` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION; 