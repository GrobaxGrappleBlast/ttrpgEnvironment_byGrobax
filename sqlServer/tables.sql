CREATE DATABASE `TTPRPGSystem`;  

CREATE TABLE `TTPRPGSystem`.definition (
	`id` 			INT auto_increment NOT NULL,
	`name` 			varchar(100) CHARACTER SET armscii8 COLLATE armscii8_general_ci NOT NULL,
	`code` 			uuid DEFAULT UUID() NOT NULL,
	`author` 		varchar(100) NOT NULL,
	`version`		varchar(10) NULL DEFAULT '0.0.1a',
	CONSTRAINT index_pk PRIMARY KEY (id),
	CONSTRAINT index_unique UNIQUE KEY (code)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci
AUTO_INCREMENT=1;


CREATE TABLE `TTPRPGSystem`.factory (
	`definition`	INT NOT NULL,
	`JSON`			TEXT DEFAULT '{}' NOT NULL,
	CONSTRAINT factory_definition_FK FOREIGN KEY (definition) REFERENCES `TTPRPGSystem`.definition(id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci
AUTO_INCREMENT=1;

CREATE TABLE `TTPRPGSystem`.dataTable_index (
	`id` INT auto_increment NOT NULL,
	`definition` INT NULL,
	`group` varchar(100) NOT NULL,
	`collection` varchar(100) NOT NULL,
	`table` varchar(100) NOT NULL,
	CONSTRAINT dataTables_pk PRIMARY KEY (id),
	CONSTRAINT dataTable_index_definition_FK FOREIGN KEY (id) REFERENCES `TTPRPGSystem`.definition(id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci
AUTO_INCREMENT=1;
CREATE INDEX dataTable_index_group_IDX USING BTREE ON `TTPRPGSystem`.dataTable_index (`group`,collection,`table`);


CREATE TABLE `TTPRPGSystem`.dataTable_data (
	`table_id` INT NULL,
	`level` INT NULL,
	`id` INT auto_increment NOT NULL,
	CONSTRAINT dataTable_data_pk PRIMARY KEY (id),
	CONSTRAINT dataTable_data_dataTable_index_FK FOREIGN KEY (table_id) REFERENCES `TTPRPGSystem`.dataTable_index(id) ON DELETE CASCADE
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci
AUTO_INCREMENT=1;

