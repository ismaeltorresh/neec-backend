USE neec_dev;

CREATE TABLE IF NOT EXISTS address (
  createdAt DATETIME,
  dataSource VARCHAR(255),
  id VARCHAR(255),
  recordStatus BOOLEAN,
  updatedAt DATETIME,
  updatedBy VARCHAR(255),
  useAs VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS blogs (
  content VARCHAR(255),
  createdAt DATETIME,
  dataSource VARCHAR(255),
  date DATETIME,
  featureImage VARCHAR(255),
  id VARCHAR(255),
  isPublished BOOLEAN,
  lastUpdate DATETIME,
  recordStatus BOOLEAN,
  sumary VARCHAR(255),
  tagList TEXT,
  title VARCHAR(255),
  updatedAt DATETIME,
  updatedBy VARCHAR(255),
  useAs VARCHAR(255),
  userId VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS people (
  createdAt DATETIME,
  dataSource VARCHAR(255) NOT NULL,
  id VARCHAR(255) NOT NULL,
  recordStatus BOOLEAN NOT NULL,
  updatedAt DATETIME NOT NULL,
  updatedBy VARCHAR(255) NOT NULL,
  useAs VARCHAR(255) NOT NULL,
  nameOne VARCHAR(255) NOT NULL,
  nameTwo VARCHAR(255),
  nameThree VARCHAR(255),
  birthdate DATETIME,
  birthHour VARCHAR(255),
  birthCountry VARCHAR(255),
  identificationNumber VARCHAR(255) NOT NULL,
  identificationType VARCHAR(255) NOT NULL,
  genderBirth VARCHAR(255),
  genderCurrent VARCHAR(255),
  maritalStatus VARCHAR(255),
  language VARCHAR(255),
  weight INT,
  height INT,
  bloodType VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS template (
  createdAt DATETIME,
  dataSource VARCHAR(255),
  id VARCHAR(255),
  recordStatus BOOLEAN,
  updatedAt DATETIME,
  updatedBy VARCHAR(255),
  useAs VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
  
);