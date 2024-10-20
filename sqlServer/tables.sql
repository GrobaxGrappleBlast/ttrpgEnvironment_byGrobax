CREATE DATABASE IF NOT EXISTS `TTPRPGSystem`;  

CREATE TABLE `TTPRPGSystem`.systemDefinitions (
	`id` 			INT AUTO_INCREMENT NOT NULL,
	`name` 			varchar(100) CHARACTER SET armscii8 COLLATE armscii8_general_ci NOT NULL,
	`code` 			uuid DEFAULT UUID() NOT NULL,
	`author` 		varchar(100) NOT NULL,
	`version`		varchar(10) NULL DEFAULT '0.0.1a',
  PRIMARY KEY (`id`),  
  UNIQUE KEY `secondPrimary_systemDefinitions_code` (`code`)
)
 ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci AUTO_INCREMENT=1;

CREATE TABLE `TTPRPGSystem`.factories (
  `dId` uuid NOT NULL,
	`JSON`			TEXT DEFAULT '{}' NOT NULL,
	PRIMARY KEY (`dId`),
  CONSTRAINT `FK_factories_systemDefinitions_dId` FOREIGN KEY (`dId`) REFERENCES `systemDefinitions` (`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci AUTO_INCREMENT=1;

CREATE TABLE `TTPRPGSystem`.fileResources (
  `id` INT AUTO_INCREMENT NOT NULL,
  `name` varchar(40) NOT NULL,
  `version` varchar(20) NOT NULL,
  `data` MEDIUMBLOB NOT NULL , 
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci AUTO_INCREMENT=1;

CREATE TABLE `TTPRPGSystem`.UITemplates (
  `id` int AUTO_INCREMENT NOT NULL,
  `dId` uuid NOT NULL, 
  `name` varchar(40) NOT NULL,
  `version` varchar(20) NOT NULL,
   PRIMARY KEY (`id`),
  KEY `IX_UITemplates_dId` (`dId`),
  CONSTRAINT `FK_UITemplates_systemDefinitions_dId` FOREIGN KEY (`dId`) REFERENCES `systemDefinitions` (`code`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci AUTO_INCREMENT=1;

CREATE TABLE `TTPRPGSystem`.UITemplateFiles (
  `id`  INT NOT NULL AUTO_INCREMENT,
  `uiId` INT NOT NULL,
  `dId` uuid NOT NULL, 
  `name` varchar(40) NOT NULL,
  `version` varchar(20) NOT NULL,
  `data` MEDIUMBLOB NOT NULL , 
  PRIMARY KEY (`id`), 
  KEY `IX_UITemplateFiles_dId` (`dId`),
  KEY `UITemplateFiles_uiId` (`uiId`),
  CONSTRAINT `FK_UITemplateFiles_UITemplate_uiId`       FOREIGN KEY (`uiId`)  REFERENCES `UITemplates`       (`id`)   ON DELETE CASCADE,
  CONSTRAINT `FK_UITemplateFiles_systemDefinitions_dId` FOREIGN KEY (`dId`)   REFERENCES `systemDefinitions` (`code`) ON DELETE CASCADE
) 
ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci AUTO_INCREMENT=1;


GRANT ALL PRIVILEGES ON *.* TO 'user'@'%' IDENTIFIED BY 'passwd';
FLUSH PRIVILEGES;
