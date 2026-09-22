-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: raresync_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `access_requests`
--

DROP TABLE IF EXISTS `access_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `hospital_id` int NOT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `reason` text,
  `requested_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `purpose` varchar(100) DEFAULT NULL,
  `duration_days` int DEFAULT '30',
  `expires_at` timestamp NULL DEFAULT NULL,
  `requested_info` text,
  PRIMARY KEY (`id`),
  KEY `hospital_id` (`hospital_id`),
  KEY `idx_access_requests_doctor` (`doctor_id`),
  KEY `idx_access_requests_patient` (`patient_id`),
  KEY `idx_access_requests_status` (`status`),
  CONSTRAINT `access_requests_ibfk_1` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE,
  CONSTRAINT `access_requests_ibfk_2` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `access_requests_ibfk_3` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_requests`
--

LOCK TABLES `access_requests` WRITE;
/*!40000 ALTER TABLE `access_requests` DISABLE KEYS */;
INSERT INTO `access_requests` VALUES (1,1,2,1,'Approved','Need to review patient history for specialist consultation on Gaucher Disease treatment plan.','2026-07-02 11:44:32','2026-07-02 11:50:55',NULL,30,NULL,NULL),(2,1,1,1,'Approved','daiagnosed','2026-07-02 12:03:53','2026-07-02 12:04:38',NULL,30,NULL,NULL),(3,1,3,1,'Rejected','for information purpose','2026-07-04 10:30:07','2026-07-04 10:30:33',NULL,30,NULL,NULL),(4,1,4,1,'Approved','','2026-07-08 18:13:21','2026-07-08 18:14:20',NULL,30,NULL,NULL),(5,1,5,1,'Approved','','2026-07-09 10:40:37','2026-07-09 10:41:22',NULL,30,NULL,NULL),(6,1,5,1,'Approved','for educational purpose\n','2026-07-09 11:41:19','2026-07-09 11:45:07',NULL,30,NULL,NULL),(7,1,3,1,'Approved','','2026-07-09 11:47:19','2026-07-09 11:47:51',NULL,30,NULL,NULL),(8,1,5,1,'Approved','','2026-07-09 11:50:22','2026-07-20 08:09:36',NULL,30,NULL,NULL),(9,1,3,1,'Pending','','2026-07-10 07:58:39',NULL,NULL,30,NULL,NULL),(10,2,5,1,'Approved','','2026-07-10 08:00:50','2026-07-10 08:01:42',NULL,30,NULL,NULL),(11,2,4,1,'Approved','','2026-07-11 15:58:23','2026-07-11 16:01:00',NULL,30,NULL,NULL),(12,3,6,2,'Pending','','2026-07-14 14:01:39',NULL,NULL,30,NULL,NULL),(13,6,6,2,'Pending','Requesting access to view patient records.','2026-07-15 16:17:29',NULL,NULL,30,NULL,NULL),(14,6,4,1,'Approved','Requesting access to view patient records.','2026-07-15 16:18:41','2026-07-15 16:19:53',NULL,30,NULL,NULL),(15,1,6,2,'Pending','Requesting access to view patient records.','2026-07-18 09:40:26',NULL,NULL,30,NULL,NULL),(16,1,7,1,'Approved','Requesting access to view patient records.','2026-07-18 09:41:52','2026-07-20 08:09:25',NULL,30,NULL,NULL),(18,2,7,1,'Pending','Requesting access to view patient records.','2026-07-23 13:34:57',NULL,NULL,30,NULL,NULL),(19,10,2,1,'Pending','','2026-07-26 11:47:21',NULL,NULL,30,NULL,NULL),(20,11,12,2,'Pending','Requesting access to view patient records.','2026-07-26 12:03:26',NULL,NULL,30,NULL,NULL),(21,1,13,5,'Approved','Requesting access to view patient records.','2026-07-26 12:13:26','2026-08-08 08:43:08',NULL,30,NULL,NULL),(22,1,12,2,'Pending','Requesting access to view patient records.','2026-07-26 13:11:48',NULL,NULL,30,NULL,NULL),(23,1,14,1,'Pending','','2026-08-09 11:03:52',NULL,NULL,30,NULL,NULL),(24,10,7,1,'Pending','Requesting access to view patient records.','2026-08-09 11:13:08',NULL,NULL,30,NULL,NULL),(25,10,3,1,'Pending','Requesting access to view patient records.','2026-08-09 11:28:46',NULL,NULL,30,NULL,NULL),(26,12,12,2,'Pending','Requesting access to view patient records.','2026-08-09 12:01:37',NULL,NULL,30,NULL,NULL),(27,12,8,1,'Pending','Requesting access to view patient records.','2026-08-09 12:02:50',NULL,NULL,30,NULL,NULL),(28,3,14,1,'Pending','Requesting access to view patient records.','2026-08-09 12:13:07',NULL,NULL,30,NULL,NULL),(29,3,13,5,'Pending','Requesting access to view patient records.','2026-08-09 12:13:55',NULL,NULL,30,NULL,NULL),(30,1,15,4,'Approved','Requesting access to view patient records.','2026-08-14 11:41:33','2026-08-28 15:30:04',NULL,30,'2026-09-27 15:30:05',NULL),(31,11,14,1,'Approved','','2026-08-15 06:51:19','2026-08-15 06:52:26','Second Opinion',14,'2026-08-29 06:52:27','Medical History'),(32,5,15,4,'Approved','','2026-08-15 06:55:46','2026-08-15 06:59:36','Treatment Planning',7,'2026-08-22 06:59:36','Reports / Lab Results'),(33,2,13,5,'Pending','Specialist opinion requested by Dr. colleague','2026-08-16 11:50:51',NULL,'Second Opinion',7,NULL,'Treatment History, Diagnosis, Reports / Lab Results'),(34,2,1,1,'Approved','Specialist opinion requested by Dr. colleague','2026-08-29 02:51:05','2026-08-29 02:52:57','Diagnosis Review',7,'2026-09-05 02:52:57','Medical History, Reports / Lab Results');
/*!40000 ALTER TABLE `access_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actor_type` enum('doctor','hospital') NOT NULL,
  `actor_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `details` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=285 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,'hospital',1,'patient_created','patient',1,'Patient Ramesh Kumar added','2026-06-30 15:48:39'),(2,'hospital',1,'patient_created','patient',2,'Patient Ramesh Kumar added','2026-06-30 15:48:47'),(3,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar','2026-06-30 16:07:30'),(4,'hospital',1,'patient_updated','patient',2,'Patient Ramesh Kumar Updated updated','2026-06-30 16:10:03'),(5,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-01 09:24:40'),(6,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-01 09:24:40'),(7,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-01 09:25:53'),(8,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-01 09:25:53'),(9,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-01 09:33:45'),(10,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-01 09:33:45'),(11,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-01 09:39:01'),(12,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-01 09:39:01'),(13,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-01 09:39:54'),(14,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-01 09:39:54'),(15,'doctor',1,'record_created','medical_record',1,'diagnosis added for patient 2','2026-07-02 09:56:57'),(16,'doctor',1,'record_created','medical_record',2,'prescription added for patient 2','2026-07-02 09:57:55'),(17,'doctor',1,'record_created','medical_record',3,'treatment_note added for patient 2','2026-07-02 09:59:51'),(18,'doctor',1,'record_created','medical_record',4,'visit_history added for patient 2','2026-07-02 10:00:44'),(19,'doctor',1,'record_updated','medical_record',1,'Record updated','2026-07-02 10:03:30'),(20,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-02 10:09:37'),(21,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-02 10:09:37'),(22,'doctor',1,'record_created','medical_record',5,'diagnosis added for patient 2','2026-07-02 10:15:53'),(23,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-02 10:16:45'),(24,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-02 10:16:45'),(25,'doctor',1,'record_updated','medical_record',2,'Record updated','2026-07-02 10:17:22'),(26,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-02 10:17:40'),(27,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-02 10:17:40'),(28,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-02 10:18:23'),(29,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-02 10:18:23'),(30,'doctor',1,'access_requested','patient',2,'Doctor requested access to patient Ramesh Kumar Updated','2026-07-02 11:44:32'),(31,'hospital',1,'access_approved','access_request',1,'Request Approved','2026-07-02 11:50:55'),(32,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-02 12:02:37'),(33,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-02 12:02:37'),(34,'doctor',1,'access_requested','patient',1,'Doctor requested access to patient Ramesh Kumar','2026-07-02 12:03:53'),(35,'hospital',1,'access_approved','access_request',2,'Request Approved','2026-07-02 12:04:38'),(36,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-04 06:13:26'),(37,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-04 06:13:26'),(38,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-04 06:18:50'),(39,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-04 06:18:50'),(40,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-04 10:23:45'),(41,'hospital',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-04 10:23:45'),(42,'doctor',1,'patient_created','patient',3,'Patient Ritik Mishra added','2026-07-04 10:27:20'),(43,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-04 10:27:24'),(44,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-04 10:27:24'),(45,'doctor',1,'access_requested','patient',3,'Doctor requested access to patient Ritik Mishra','2026-07-04 10:30:07'),(46,'hospital',1,'access_rejected','access_request',3,'Request Rejected','2026-07-04 10:30:33'),(47,'doctor',1,'patient_created','patient',4,'Patient Bhavana Boga added','2026-07-08 17:46:48'),(48,'doctor',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-08 17:46:50'),(49,'doctor',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-08 17:46:50'),(50,'doctor',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-08 18:05:50'),(51,'doctor',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-08 18:05:51'),(52,'doctor',1,'record_created','medical_record',6,'diagnosis added for patient 4','2026-07-08 18:07:46'),(53,'doctor',1,'record_created','medical_record',7,'diagnosis added for patient 4','2026-07-08 18:08:54'),(54,'doctor',1,'record_created','medical_record',8,'diagnosis added for patient 4','2026-07-08 18:09:10'),(55,'doctor',1,'record_created','medical_record',9,'diagnosis added for patient 4','2026-07-08 18:09:20'),(56,'doctor',1,'record_created','medical_record',10,'diagnosis added for patient 4','2026-07-08 18:09:49'),(57,'doctor',1,'record_created','medical_record',11,'diagnosis added for patient 4','2026-07-08 18:10:24'),(58,'doctor',1,'record_created','medical_record',12,'treatment_note added for patient 4','2026-07-08 18:11:38'),(59,'doctor',1,'record_created','medical_record',13,'prescription added for patient 4','2026-07-08 18:12:29'),(60,'doctor',1,'access_requested','patient',4,'Doctor requested access to patient Bhavana Boga','2026-07-08 18:13:21'),(61,'hospital',1,'access_approved','access_request',4,'Request Approved','2026-07-08 18:14:21'),(62,'doctor',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-08 18:14:37'),(63,'doctor',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-08 18:14:37'),(64,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-08 18:14:51'),(65,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-08 18:14:51'),(66,'doctor',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-09 09:44:32'),(67,'doctor',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-09 09:44:33'),(68,'doctor',1,'patient_created','patient',5,'Patient Arun Boga added','2026-07-09 09:49:34'),(69,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 09:49:42'),(70,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 09:49:42'),(71,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 09:49:59'),(72,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 09:49:59'),(73,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 09:56:46'),(74,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 09:56:46'),(75,'doctor',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-09 09:59:04'),(76,'doctor',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-09 09:59:04'),(77,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 10:40:21'),(78,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 10:40:21'),(79,'doctor',1,'access_requested','patient',5,'Doctor requested access to patient Arun Boga','2026-07-09 10:40:37'),(80,'hospital',1,'access_approved','access_request',5,'Request Approved','2026-07-09 10:41:22'),(81,'doctor',1,'access_requested','patient',5,'Doctor requested access to patient Arun Boga','2026-07-09 11:41:19'),(82,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 11:41:35'),(83,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 11:41:35'),(84,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 11:41:59'),(85,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 11:41:59'),(86,'hospital',1,'access_approved','access_request',6,'Request Approved','2026-07-09 11:45:07'),(87,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 11:46:09'),(88,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 11:46:09'),(89,'doctor',1,'access_requested','patient',3,'Doctor requested access to patient Ritik Mishra','2026-07-09 11:47:19'),(90,'hospital',1,'access_approved','access_request',7,'Request Approved','2026-07-09 11:47:51'),(91,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-09 11:48:37'),(92,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-09 11:48:37'),(93,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-09 11:49:15'),(94,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-09 11:49:15'),(95,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 11:50:09'),(96,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-09 11:50:09'),(97,'doctor',1,'access_requested','patient',5,'Doctor requested access to patient Arun Boga','2026-07-09 11:50:22'),(98,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-10 07:57:41'),(99,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-10 07:57:41'),(100,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-10 07:57:56'),(101,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-10 07:57:56'),(102,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-10 07:58:05'),(103,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-10 07:58:05'),(104,'doctor',1,'access_requested','patient',3,'Doctor requested access to patient Ritik Mishra','2026-07-10 07:58:39'),(105,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-10 08:00:41'),(106,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-10 08:00:41'),(107,'doctor',2,'access_requested','patient',5,'Doctor requested access to patient Arun Boga','2026-07-10 08:00:50'),(108,'hospital',1,'access_approved','access_request',10,'Request Approved','2026-07-10 08:01:42'),(109,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-10 08:02:14'),(110,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-10 08:02:14'),(111,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 05:39:27'),(112,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 05:39:27'),(113,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 05:40:31'),(114,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 05:40:31'),(115,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 05:40:56'),(116,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 05:40:56'),(117,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 05:42:39'),(118,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 05:42:39'),(119,'doctor',1,'record_created','medical_record',14,'diagnosis added for patient 5','2026-07-11 05:46:03'),(120,'doctor',1,'record_created','medical_record',15,'prescription added for patient 5','2026-07-11 05:50:24'),(121,'doctor',1,'record_created','medical_record',16,'treatment_note added for patient 5','2026-07-11 05:53:35'),(122,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 05:54:05'),(123,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 05:54:05'),(124,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 06:00:42'),(125,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 06:00:42'),(126,'doctor',2,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-11 06:00:51'),(127,'doctor',2,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-11 06:00:51'),(128,'doctor',2,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-11 15:58:16'),(129,'doctor',2,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-11 15:58:16'),(130,'doctor',2,'access_requested','patient',4,'Doctor requested access to patient Bhavana Boga','2026-07-11 15:58:23'),(131,'doctor',2,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-11 15:58:39'),(132,'doctor',2,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-11 15:58:39'),(133,'hospital',1,'access_approved','access_request',11,'Request Approved','2026-07-11 16:01:00'),(134,'doctor',2,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-11 16:01:26'),(135,'doctor',2,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-11 16:01:26'),(136,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 16:02:49'),(137,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-11 16:02:49'),(138,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-11 16:03:45'),(139,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-11 16:03:45'),(140,'doctor',1,'record_created','medical_record',17,'diagnosis added for patient 3','2026-07-11 16:04:23'),(141,'doctor',3,'patient_created','patient',6,'Patient Harini Boga added','2026-07-14 14:01:28'),(142,'doctor',3,'record_viewed','patient',6,'Viewed patient Harini Boga','2026-07-14 14:01:32'),(143,'doctor',3,'record_viewed','patient',6,'Viewed patient Harini Boga','2026-07-14 14:01:32'),(144,'doctor',3,'access_requested','patient',6,'Doctor requested access to patient Harini Boga','2026-07-14 14:01:39'),(145,'doctor',6,'access_requested','patient',6,'Doctor requested access to patient Harini Boga','2026-07-15 16:17:29'),(146,'doctor',6,'access_requested','patient',4,'Doctor requested access to patient Bhavana Boga','2026-07-15 16:18:41'),(147,'hospital',1,'access_approved','access_request',14,'Request Approved','2026-07-15 16:19:54'),(148,'doctor',6,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-15 16:22:00'),(149,'doctor',6,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-07-15 16:22:00'),(150,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-18 09:40:05'),(151,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-18 09:40:05'),(152,'doctor',1,'access_requested','patient',6,'Doctor requested access to patient Harini Boga','2026-07-18 09:40:26'),(153,'doctor',1,'patient_created','patient',7,'Patient Uma Boga added','2026-07-18 09:41:49'),(154,'doctor',1,'access_requested','patient',7,'Doctor requested access to patient Uma Boga','2026-07-18 09:41:52'),(155,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-18 15:30:04'),(156,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-18 15:30:04'),(157,'doctor',1,'patient_created','patient',8,'Patient RareSync added','2026-07-20 08:08:13'),(158,'hospital',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-20 08:09:11'),(159,'hospital',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-20 08:09:11'),(160,'hospital',1,'access_approved','access_request',16,'Request Approved','2026-07-20 08:09:25'),(161,'hospital',1,'access_approved','access_request',8,'Request Approved','2026-07-20 08:09:36'),(162,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-20 08:17:47'),(163,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-20 08:17:47'),(164,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-20 08:36:27'),(165,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-20 08:36:27'),(166,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-20 08:36:39'),(167,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-20 08:36:39'),(168,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-20 08:36:54'),(169,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-20 08:36:54'),(170,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-20 08:37:25'),(171,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-20 08:37:25'),(172,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-20 08:37:43'),(173,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-20 08:37:44'),(174,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-20 08:38:19'),(175,'doctor',2,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-20 08:38:19'),(176,'doctor',2,'patient_created','patient',9,'Patient Rohan tikka added','2026-07-20 08:39:00'),(177,'doctor',2,'record_viewed','patient',9,'Viewed patient Rohan tikka','2026-07-20 08:39:06'),(178,'doctor',2,'record_viewed','patient',9,'Viewed patient Rohan tikka','2026-07-20 08:39:06'),(179,'doctor',2,'record_viewed','patient',9,'Viewed patient Rohan tikka','2026-07-20 08:39:23'),(180,'doctor',2,'record_viewed','patient',9,'Viewed patient Rohan tikka','2026-07-20 08:39:23'),(181,'doctor',2,'record_viewed','patient',9,'Viewed patient Rohan tikka','2026-07-20 08:45:00'),(182,'doctor',2,'record_viewed','patient',9,'Viewed patient Rohan tikka','2026-07-20 08:45:00'),(183,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-20 08:45:41'),(184,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-20 08:45:41'),(185,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-20 08:45:49'),(186,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-20 08:45:49'),(187,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-21 04:41:12'),(188,'doctor',1,'record_viewed','patient',3,'Viewed patient Ritik Mishra','2026-07-21 04:41:12'),(189,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-21 04:41:23'),(190,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-21 04:41:23'),(191,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-21 04:42:22'),(192,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-21 04:42:22'),(193,'doctor',1,'access_requested','patient',9,'Doctor requested access to patient Rohan tikka','2026-07-21 04:44:09'),(194,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-22 17:07:43'),(195,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-22 17:07:43'),(196,'doctor',1,'record_viewed','patient',7,'Viewed patient Uma Boga','2026-07-22 17:07:53'),(197,'doctor',1,'record_viewed','patient',7,'Viewed patient Uma Boga','2026-07-22 17:07:53'),(198,'doctor',1,'record_viewed','patient',6,'Viewed patient Harini Boga','2026-07-22 17:08:17'),(199,'doctor',1,'record_viewed','patient',6,'Viewed patient Harini Boga','2026-07-22 17:08:17'),(200,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-22 17:37:17'),(201,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-22 17:37:17'),(202,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-22 17:37:24'),(203,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-07-22 17:37:24'),(204,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-22 17:37:38'),(205,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-07-22 17:37:38'),(206,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-22 17:37:43'),(207,'doctor',1,'record_viewed','patient',5,'Viewed patient Arun Boga','2026-07-22 17:37:43'),(208,'doctor',1,'record_viewed','patient',9,'Viewed patient Rohan tikka','2026-07-23 13:33:37'),(209,'doctor',1,'record_viewed','patient',9,'Viewed patient Rohan tikka','2026-07-23 13:33:37'),(210,'doctor',1,'patient_created','patient',10,'Patient  natasha  added','2026-07-23 13:34:12'),(211,'doctor',1,'record_viewed','patient',10,'Viewed patient  natasha ','2026-07-23 13:34:15'),(212,'doctor',1,'record_viewed','patient',10,'Viewed patient  natasha ','2026-07-23 13:34:15'),(213,'doctor',1,'record_viewed','patient',9,'Viewed patient Rohan tikka','2026-07-23 13:34:22'),(214,'doctor',1,'record_viewed','patient',9,'Viewed patient Rohan tikka','2026-07-23 13:34:22'),(215,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-23 13:34:32'),(216,'doctor',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-07-23 13:34:32'),(217,'doctor',2,'access_requested','patient',7,'Doctor requested access to patient Uma Boga','2026-07-23 13:34:57'),(218,'doctor',2,'patient_created','patient',11,'Patient varsha reddy added','2026-07-23 13:35:19'),(219,'doctor',2,'record_viewed','patient',11,'Viewed patient varsha reddy','2026-07-23 13:35:22'),(220,'doctor',2,'record_viewed','patient',11,'Viewed patient varsha reddy','2026-07-23 13:35:22'),(221,'doctor',1,'record_viewed','patient',11,'Viewed patient varsha reddy','2026-07-23 13:35:36'),(222,'doctor',1,'record_viewed','patient',11,'Viewed patient varsha reddy','2026-07-23 13:35:36'),(223,'hospital',1,'patient_deleted','patient',11,'Patient varsha reddy deleted','2026-07-23 13:41:38'),(224,'hospital',1,'patient_deleted','patient',10,'Patient  natasha  deleted','2026-07-23 13:41:41'),(225,'hospital',1,'patient_deleted','patient',9,'Patient Rohan tikka deleted','2026-07-23 13:41:46'),(226,'doctor',10,'access_requested','patient',2,'Doctor requested access to patient Ramesh Kumar Updated','2026-07-26 11:47:21'),(227,'doctor',10,'patient_created','patient',12,'Patient Rohan Redkar added','2026-07-26 11:48:28'),(228,'doctor',10,'record_viewed','patient',12,'Viewed patient Rohan Redkar','2026-07-26 11:48:39'),(229,'doctor',10,'record_viewed','patient',12,'Viewed patient Rohan Redkar','2026-07-26 11:48:39'),(230,'doctor',10,'record_viewed','patient',12,'Viewed patient Rohan Redkar','2026-07-26 11:49:50'),(231,'doctor',10,'record_viewed','patient',12,'Viewed patient Rohan Redkar','2026-07-26 11:49:50'),(232,'doctor',10,'record_created','medical_record',18,'diagnosis added for patient 12','2026-07-26 11:52:28'),(233,'doctor',10,'record_created','medical_record',19,'prescription added for patient 12','2026-07-26 11:54:13'),(234,'doctor',10,'record_created','medical_record',20,'treatment_note added for patient 12','2026-07-26 11:56:22'),(235,'doctor',10,'record_created','medical_record',21,'visit_history added for patient 12','2026-07-26 11:57:00'),(236,'doctor',11,'access_requested','patient',12,'Doctor requested access to patient Rohan Redkar','2026-07-26 12:03:26'),(237,'doctor',12,'patient_created','patient',13,'Patient Rohan Redkar added','2026-07-26 12:06:11'),(238,'hospital',5,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-07-26 12:06:57'),(239,'hospital',5,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-07-26 12:06:57'),(240,'doctor',12,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-07-26 12:11:55'),(241,'doctor',12,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-07-26 12:11:55'),(242,'doctor',12,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-07-26 12:12:06'),(243,'doctor',12,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-07-26 12:12:06'),(244,'doctor',12,'record_created','medical_record',22,'diagnosis added for patient 13','2026-07-26 12:12:40'),(245,'doctor',1,'access_requested','patient',13,'Doctor requested access to patient Rohan Redkar','2026-07-26 12:13:26'),(246,'doctor',1,'access_requested','patient',12,'Doctor requested access to patient Rohan Redkar','2026-07-26 13:11:48'),(247,'hospital',5,'access_approved','access_request',21,'Request Approved','2026-08-08 08:43:08'),(248,'hospital',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-08-08 08:47:29'),(249,'hospital',1,'record_viewed','patient',4,'Viewed patient Bhavana Boga','2026-08-08 08:47:29'),(250,'hospital',1,'patient_created','patient',14,'Patient Pratik Patil added','2026-08-09 11:03:29'),(251,'doctor',1,'record_viewed','patient',14,'Viewed patient Pratik Patil','2026-08-09 11:03:50'),(252,'doctor',1,'record_viewed','patient',14,'Viewed patient Pratik Patil','2026-08-09 11:03:50'),(253,'doctor',1,'access_requested','patient',14,'Doctor requested access to patient Pratik Patil','2026-08-09 11:03:52'),(254,'doctor',10,'access_requested','patient',7,'Doctor requested access to patient Uma Boga','2026-08-09 11:13:08'),(255,'doctor',10,'access_requested','patient',3,'Doctor requested access to patient Ritik Mishra','2026-08-09 11:28:46'),(256,'doctor',12,'access_requested','patient',12,'Doctor requested access to patient Rohan Redkar','2026-08-09 12:01:37'),(257,'doctor',12,'access_requested','patient',8,'Doctor requested access to patient RareSync','2026-08-09 12:02:50'),(258,'doctor',3,'access_requested','patient',14,'Doctor requested access to patient Pratik Patil','2026-08-09 12:13:07'),(259,'doctor',3,'access_requested','patient',13,'Doctor requested access to patient Rohan Redkar','2026-08-09 12:13:55'),(260,'hospital',4,'patient_created','patient',15,'Patient Ritik Mishra added','2026-08-14 11:40:55'),(261,'doctor',1,'access_requested','patient',15,'Doctor requested access to patient Ritik Mishra','2026-08-14 11:41:33'),(262,'doctor',11,'access_requested','patient',14,'Doctor requested access for: Second Opinion','2026-08-15 06:51:19'),(263,'hospital',1,'access_approved','access_request',31,'Request Approved','2026-08-15 06:52:26'),(264,'doctor',11,'record_viewed','patient',14,'Viewed patient Pratik Patil','2026-08-15 06:52:48'),(265,'doctor',11,'record_viewed','patient',14,'Viewed patient Pratik Patil','2026-08-15 06:52:48'),(266,'doctor',5,'access_requested','patient',15,'Doctor requested access for: Treatment Planning','2026-08-15 06:55:46'),(267,'hospital',4,'access_approved','access_request',32,'Request Approved','2026-08-15 06:59:36'),(268,'doctor',1,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-08-16 11:49:46'),(269,'doctor',1,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-08-16 11:49:46'),(270,'doctor',1,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-08-16 11:52:25'),(271,'doctor',1,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-08-16 11:52:25'),(272,'doctor',1,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-08-16 11:52:47'),(273,'doctor',1,'record_viewed','patient',13,'Viewed patient Rohan Redkar','2026-08-16 11:52:47'),(274,'hospital',4,'access_approved','access_request',30,'Request Approved','2026-08-28 15:30:04'),(275,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-08-29 02:48:49'),(276,'doctor',1,'record_viewed','patient',2,'Viewed patient Ramesh Kumar Updated','2026-08-29 02:48:49'),(277,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-08-29 02:50:16'),(278,'doctor',1,'record_viewed','patient',1,'Viewed patient Ramesh Kumar','2026-08-29 02:50:16'),(279,'hospital',1,'access_approved','access_request',34,'Request Approved','2026-08-29 02:52:57'),(280,'doctor',1,'record_viewed','patient',15,'Viewed patient Ritik Mishra','2026-09-05 05:53:01'),(281,'doctor',1,'record_viewed','patient',15,'Viewed patient Ritik Mishra','2026-09-05 05:53:01'),(282,'hospital',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-09-05 10:09:48'),(283,'hospital',1,'record_viewed','patient',8,'Viewed patient RareSync','2026-09-05 10:09:48'),(284,'hospital',1,'patient_deleted','patient',8,'Patient RareSync deleted','2026-09-05 10:10:02');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaboration_members`
--

DROP TABLE IF EXISTS `collaboration_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collaboration_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `role` enum('primary','specialist','collaborator') DEFAULT 'collaborator',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `collaboration_members_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `collaboration_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collaboration_members_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaboration_members`
--

LOCK TABLES `collaboration_members` WRITE;
/*!40000 ALTER TABLE `collaboration_members` DISABLE KEYS */;
INSERT INTO `collaboration_members` VALUES (1,1,1,'primary','2026-08-16 11:50:05'),(2,1,2,'specialist','2026-08-16 11:51:35'),(3,2,1,'primary','2026-08-29 02:48:54'),(4,3,1,'primary','2026-08-29 02:50:26');
/*!40000 ALTER TABLE `collaboration_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaboration_messages`
--

DROP TABLE IF EXISTS `collaboration_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collaboration_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `doctor_id` (`doctor_id`),
  CONSTRAINT `collaboration_messages_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `collaboration_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collaboration_messages_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaboration_messages`
--

LOCK TABLES `collaboration_messages` WRITE;
/*!40000 ALTER TABLE `collaboration_messages` DISABLE KEYS */;
INSERT INTO `collaboration_messages` VALUES (1,1,2,'Dr. Harini Boga (Cardiologist) has joined as a specialist.','2026-08-16 11:51:35');
/*!40000 ALTER TABLE `collaboration_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `collaboration_rooms`
--

DROP TABLE IF EXISTS `collaboration_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collaboration_rooms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `created_by_doctor` int NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `status` enum('active','closed') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `created_by_doctor` (`created_by_doctor`),
  CONSTRAINT `collaboration_rooms_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `collaboration_rooms_ibfk_2` FOREIGN KEY (`created_by_doctor`) REFERENCES `doctors` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collaboration_rooms`
--

LOCK TABLES `collaboration_rooms` WRITE;
/*!40000 ALTER TABLE `collaboration_rooms` DISABLE KEYS */;
INSERT INTO `collaboration_rooms` VALUES (1,13,1,'Case: Rohan Redkar',NULL,'active','2026-08-16 11:50:05'),(2,2,1,'Case: Ramesh Kumar Updated',NULL,'active','2026-08-29 02:48:54'),(3,1,1,'Case: Ramesh Kumar',NULL,'active','2026-08-29 02:50:26');
/*!40000 ALTER TABLE `collaboration_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `doctors`
--

DROP TABLE IF EXISTS `doctors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hospital_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `bio` text,
  `experience_years` int DEFAULT '0',
  `education` text,
  `languages` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `hospital_id` (`hospital_id`),
  CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doctors`
--

LOCK TABLES `doctors` WRITE;
/*!40000 ALTER TABLE `doctors` DISABLE KEYS */;
INSERT INTO `doctors` VALUES (1,1,'Dr. Priya Sharma','h06791757@gmail.com','$2b$10$nCyoOI08HSpnOA/wHroeJekGVDiXvsi93yWpqwYcCuFdAt9rr41iC','Neurologist','9123456780','2026-06-29 09:38:30','Dr. Priya Sharma is an experienced neurologist with 10 years of professional experience. She holds an MBBS from AIIMS Delhi and an MD in Neurology from PGI Chandigarh. She specializes in diagnosing and managing neurological disorders and is committed to providing compassionate, patient-centered care.',10,'MBBS - AIIMS Delhi (2010), MD Neurology - PGI Chandigarh (2014)','English, Hindi, Marathi'),(2,1,'Harini Boga','Harini@doctor.com','$2b$10$x1mLjg9dHa.h2N1eCD0XP.7VAm6xu/aZWraVWJphvpVSrCgkAnm32','Cardiologist','7021192565','2026-07-10 08:00:07',NULL,0,NULL,NULL),(3,2,'Ritik Mishra','vu1f2425129@pvppcoe.ac.in','$2b$10$s9FVTX/tKAsUHuPsi4Ue9upmH89PTau4FaFdNbN.FdWSVGHswA67u','Cardiologist','7021192565','2026-07-14 13:53:44',NULL,0,NULL,NULL),(4,1,'Riya ','ria@doctor','$2b$10$XDnMnCxJbqvxnUpm2Vm3Su6Re8XZ8hh.KIea90DkO2iGb7EbycF.C','dentist','6547899920','2026-07-15 14:52:37',NULL,0,NULL,NULL),(5,1,'Sathvik Shetty','vu1f2425128@pvppcoe.ac.in','$2b$10$ng0o9I.WC.DXbTn83Yzm9usRZSrjGqPS5ue8y767p3vHWHOKjneTu','Cardiologist','9876543210','2026-07-15 14:56:11',NULL,0,NULL,NULL),(6,2,'Pratik Patil','vu1f2425130@pvppcoe.ac.in','$2b$10$7jBLV.rz33VefuK/lsDJzeaNQGjyflzB2WlEP5R6wZVwv3.Ma/.62','Gynocologist','1234567890','2026-07-15 14:58:55',NULL,0,NULL,NULL),(10,2,'Shravani Nikange','shravani@doctor.com','$2b$10$LgHMSV4PFqJFryOaa4uVmeB9XImE33QsyPyfjfjKexl6dnS0Yrpue','Gynocologist','7021192565','2026-07-26 11:45:44',NULL,0,NULL,NULL),(11,5,'Rahul','rahul@doctor.com','$2b$10$7TigI.1APkRuwiYUMXnYrOLw3bhPE5T6BrcF/6R7KZUms.XBgFibG','dentist','6547899920','2026-07-26 12:02:46',NULL,0,NULL,NULL),(12,5,'Siya ','siya@doctor.com','$2b$10$2xfGcLK1qJBClU7RasBWj.18.kizzIGaLiHxsGPy0hG/xdUcGtzhG','Cardiologist','','2026-07-26 12:05:00',NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `doctors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hospitals`
--

DROP TABLE IF EXISTS `hospitals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hospitals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` text,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `description` text,
  `established_year` int DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `bed_count` int DEFAULT '0',
  `specialties` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hospitals`
--

LOCK TABLES `hospitals` WRITE;
/*!40000 ALTER TABLE `hospitals` DISABLE KEYS */;
INSERT INTO `hospitals` VALUES (1,'City Hospital','bogaharini6@gmail.com','$2b$10$z2QhKDd6uuh3CmAB76KkR.kcYTEh0Z7El7YEo7AXr/ypg5.69c0i2','123 Main Street, Mumbai','9876543210','2026-06-29 09:32:59',NULL,NULL,NULL,0,NULL),(2,'Apollo Hospital','bogaharini6@hospital.com','$2b$10$3ZaPEVTGWHaV2SRCBpbxveXogK4slFuZjxYa9vIFL7MBsPwLQSwYm','Mumbai','9876543210','2026-07-12 12:43:24',NULL,NULL,NULL,0,NULL),(4,'uma','bogaharini6apollo@gmail.com','$2b$10$OBnFx2kioSLnD3Oa2/kHYOgcm75FeHXIWeZp6id2nAb1Ghnq97yAu','','','2026-07-14 14:03:54',NULL,NULL,NULL,0,NULL),(5,'Lilavati Hospital','Lilavati@hospital.com','$2b$10$eiHFhi2jU3/soZa4EDvlVOv68.UejiE2FPWrGLlerviivQFa5AFWm','','1234567889','2026-07-26 12:01:01',NULL,NULL,NULL,0,NULL),(8,'Lilavati Hospital','bogaharini6W@gmail.com','$2b$10$KlKGHGJWbZeGuspb/pszqeLeViGMKSgA5DR3pk3eV/qHu6GBCfQhy','Lower Parel','1234567889','2026-07-26 12:31:55',NULL,NULL,NULL,0,NULL),(9,'Sion Hospital','sion@hospital.com','$2b$10$XLLh65/WdW52UfEEMHHtLOmxub/T.1085lJU/f1B5KX0ztAdQNZF6','Sion','1234567890','2026-08-09 11:31:03',NULL,NULL,NULL,0,NULL);
/*!40000 ALTER TABLE `hospitals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `medical_records`
--

DROP TABLE IF EXISTS `medical_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `record_type` enum('diagnosis','prescription','treatment_note','visit_history') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `visit_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_medical_records_patient` (`patient_id`),
  KEY `idx_medical_records_doctor` (`doctor_id`),
  CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `medical_records_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_records`
--

LOCK TABLES `medical_records` WRITE;
/*!40000 ALTER TABLE `medical_records` DISABLE KEYS */;
INSERT INTO `medical_records` VALUES (1,2,1,'diagnosis','Initial Diagnosis - Updated','Patient presents with enlarged spleen and fatigue. Genetic testing confirms Gaucher Disease Type 1. Hemoglobin levels low at 9.2 g/dL. Bone density scan ordered.','2024-01-15','2026-07-02 09:56:57'),(2,2,1,'prescription','ERT Prescription','Imiglucerase (Cerezyme) 60 units/kg IV every 2 weeks. Monitor CBC and liver enzymes monthly.','2024-01-14','2026-07-02 09:57:55'),(3,2,1,'treatment_note','ERT Session 1','First ERT infusion completed without adverse reactions. Patient tolerated well. Vitals stable throughout.','2024-02-01','2026-07-02 09:59:51'),(4,2,1,'visit_history','Follow-up Visit','3 month follow-up. Spleen size reduced by 15%. Hemoglobin improved to 11.4 g/dL. Patient reports reduced fatigue. Continue current treatment plan.','2024-04-15','2026-07-02 10:00:44'),(5,2,1,'diagnosis','Iron Deficiency Anemia','Patient complains of fatigue, dizziness, and weakness for the past two weeks.\nBlood tests indicate iron deficiency anemia with low hemoglobin levels.\nStarted oral iron supplementation and advised an iron-rich diet.\nFollow-up scheduled after 4 weeks to monitor improvement.','2026-07-02','2026-07-02 10:15:53'),(6,4,1,'diagnosis','','Fabry disease is diagnosed through clinical evaluation, blood tests measuring alpha-galactosidase A enzyme activity, and confirmation by GLA gene genetic testing. Additional investigations such as urine and kidney function tests, ECG, echocardiography, brain MRI (when indicated), and family screening help assess organ involvement and confirm the diagnosis.','2026-07-08','2026-07-08 18:07:46'),(7,4,1,'diagnosis','','Agalsidase beta 1 mg/kg IV infusion every 2 weeks (Enzyme Replacement Therapy), or\nAgalsidase alfa 0.2 mg/kg IV infusion every 2 weeks.\nMigalastat 123 mg orally every other day (for patients with amenable GLA gene variants).\nGabapentin 300 mg orally at bedtime or as prescribed for nerve pain.\nLisinopril 10 mg once daily if kidney involvement or high blood pressure is present.\nParacetamol 500 mg as needed for pain or fever.','2026-07-08','2026-07-08 18:08:54'),(8,4,1,'diagnosis','','Agalsidase beta 1 mg/kg IV infusion every 2 weeks (Enzyme Replacement Therapy), or\nAgalsidase alfa 0.2 mg/kg IV infusion every 2 weeks.\nMigalastat 123 mg orally every other day (for patients with amenable GLA gene variants).\nGabapentin 300 mg orally at bedtime or as prescribed for nerve pain.\nLisinopril 10 mg once daily if kidney involvement or high blood pressure is present.\nParacetamol 500 mg as needed for pain or fever.','2026-07-08','2026-07-08 18:09:10'),(9,4,1,'diagnosis','','Agalsidase beta 1 mg/kg IV infusion every 2 weeks (Enzyme Replacement Therapy), or\nAgalsidase alfa 0.2 mg/kg IV infusion every 2 weeks.\nMigalastat 123 mg orally every other day (for patients with amenable GLA gene variants).\nGabapentin 300 mg orally at bedtime or as prescribed for nerve pain.\nLisinopril 10 mg once daily if kidney involvement or high blood pressure is present.\nParacetamol 500 mg as needed for pain or fever.',NULL,'2026-07-08 18:09:20'),(10,4,1,'diagnosis','','Agalsidase beta 1 mg/kg IV infusion every 2 weeks (Enzyme Replacement Therapy), or\nAgalsidase alfa 0.2 mg/kg IV infusion every 2 weeks.\nMigalastat 123 mg orally every other day (for patients with amenable GLA gene variants).\nGabapentin 300 mg orally at bedtime or as prescribed for nerve pain.\nLisinopril 10 mg once daily if kidney involvement or high blood pressure is present.\nParacetamol 500 mg as needed for pain or fever.',NULL,'2026-07-08 18:09:49'),(11,4,1,'diagnosis','','Agalsidase beta 1 mg/kg IV infusion every 2 weeks (Enzyme Replacement Therapy), or\nAgalsidase alfa 0.2 mg/kg IV infusion every 2 weeks.\nMigalastat 123 mg orally every other day (for patients with amenable GLA gene variants).\nGabapentin 300 mg orally at bedtime or as prescribed for nerve pain.\nLisinopril 10 mg once daily if kidney involvement or high blood pressure is present.\nParacetamol 500 mg as needed for pain or fever.\n ',NULL,'2026-07-08 18:10:24'),(12,4,1,'treatment_note','','Begin enzyme replacement therapy (ERT) or migalastat if the patient is eligible. Manage symptoms with pain-relieving medications and treat complications affecting the kidneys, heart, and nervous system. Monitor kidney function, cardiac health, and neurological status regularly. Encourage adequate hydration, avoid overheating, and provide genetic counseling and family screening. Schedule regular follow-up visits to assess treatment response and disease progression.','2026-07-08','2026-07-08 18:11:38'),(13,4,1,'prescription','','Agalsidase beta 1 mg/kg IV infusion every 2 weeks (Enzyme Replacement Therapy), or\nAgalsidase alfa 0.2 mg/kg IV infusion every 2 weeks.\nMigalastat 123 mg orally every other day (for patients with amenable GLA gene variants).\nGabapentin 300 mg orally at bedtime or as prescribed for nerve pain.\nLisinopril 10 mg once daily if kidney involvement or high blood pressure is present.\nParacetamol 500 mg as needed for pain or fever.',NULL,'2026-07-08 18:12:29'),(14,5,1,'diagnosis','Gaucher Disease','{\"main\":\"A rare inherited metabolic disorder where fatty substances accumulate in cells and organs.\",\"symptoms\":\"Enlarged spleen and liver, fatigue, anemia, bone pain, easy bruising.\",\"prescription\":\"\",\"treatment_plan\":\"Enzyme replacement therapy (ERT), substrate reduction therapy.\",\"doctor_notes\":\"follow up requires every 10 days.\"}','2026-07-11','2026-07-11 05:46:03'),(15,5,1,'prescription','Gaucher Disease','{\"main\":\"Diagnosis: Gaucher Disease (Type 1).\\n\\nPatient presents with fatigue, enlarged spleen, mild anemia, thrombocytopenia, and intermittent bone pain. Enzyme replacement therapy to be continued. Regular monitoring of hemoglobin, platelet count, liver and spleen size, and bone health is advised.\",\"symptoms\":\"\",\"prescription\":\"• Imiglucerase 60 U/kg IV infusion every 2 weeks\\n• Calcium 500 mg + Vitamin D3 once daily\\n• Paracetamol 500 mg as needed for bone pain (maximum 3 g/day)\\n• Iron supplements if indicated based on laboratory findings\",\"treatment_plan\":\"\",\"doctor_notes\":\"Continue enzyme replacement therapy as scheduled.\\nRepeat CBC, liver function tests, and platelet count every 3 months.\\nMonitor spleen and liver size with imaging every 6–12 months.\\nMaintain adequate hydration and nutrition.\\nFollow-up visit after 3 months or earlier if symptoms worsen.\"}','2026-07-11','2026-07-11 05:50:24'),(16,5,1,'treatment_note','Gaucher Disease','{\"main\":\"Patient diagnosed with Gaucher Disease Type 1. Currently stable on enzyme replacement therapy with improvement in fatigue and reduction in spleen enlargement. Mild bone pain persists but is manageable. Laboratory values remain stable. Continue current treatment and monitor for disease progression.\",\"symptoms\":\"Fatigue, splenomegaly, hepatomegaly, anemia, thrombocytopenia, intermittent bone pain, easy bruising\",\"prescription\":\"\",\"treatment_plan\":\"Continue enzyme replacement therapy (Imiglucerase) every 2 weeks. Monitor complete blood count, liver function tests, and platelet count every 3 months. Assess spleen and liver size with imaging every 6–12 months. Continue calcium and vitamin D supplementation and encourage regular follow-up.\",\"doctor_notes\":\"Patient responding well to treatment. Maintain medication adherence and attend scheduled infusion sessions. Follow-up after 3 months or sooner if worsening bone pain, bleeding, or new symptoms develop.\"}','2026-07-11','2026-07-11 05:53:35'),(18,12,10,'diagnosis','Wilson Disease','{\"main\":\"Patient diagnosed with Wilson Disease based on low serum ceruloplasmin levels, elevated 24-hour urinary copper excretion, and the presence of Kayser-Fleischer rings on slit-lamp examination. Genetic testing supports ATP7B gene mutation. Liver function tests indicate mild hepatic dysfunction. Patient is currently stable with no signs of acute liver failure.\",\"symptoms\":\"Fatigue, mild jaundice, abdominal discomfort, hand tremors, difficulty with coordination, occasional slurred speech, and mood changes.\",\"prescription\":\"Penicillamine 250 mg orally twice daily.\\nPyridoxine (Vitamin B6) 25 mg once daily.\\nZinc acetate 50 mg three times daily.\\nAdvise low-copper diet (avoid shellfish, liver, nuts, chocolate, mushrooms, and organ meats).\",\"treatment_plan\":\"Continue copper-chelating therapy with Penicillamine and Zinc acetate. Monitor liver function tests, serum ceruloplasmin, and 24-hour urinary copper every 3 months. Schedule ophthalmology and neurology follow-up visits. Educate patient regarding lifelong medication adherence and dietary restrictions.\",\"doctor_notes\":\"Patient and family counseled regarding the hereditary nature of Wilson Disease. Emphasized strict compliance with medications and dietary modifications. Follow-up appointment scheduled after 4 weeks to assess treatment response and monitor for adverse effects.\"}','2026-07-26','2026-07-26 11:52:28'),(19,12,10,'prescription','Wilson Disease Medication Plan – Initial Prescription','{\"main\":\"Patient prescribed copper-chelating therapy to reduce excess copper accumulation associated with Wilson Disease. Treatment is intended for lifelong management to prevent liver damage and neurological complications. Patient advised to take medications regularly and attend routine follow-up appointments for monitoring.\",\"symptoms\":\"\",\"prescription\":\"• Penicillamine 250 mg orally twice daily before meals.\\n• Pyridoxine (Vitamin B6) 25 mg orally once daily.\\n• Zinc Acetate 50 mg orally three times daily, taken at least 1 hour before or 2 hours after meals.\\n• Follow a low-copper diet by avoiding liver, shellfish, chocolate, nuts, mushrooms, and organ meats.\",\"treatment_plan\":\"\",\"doctor_notes\":\"Patient educated about the importance of lifelong treatment and medication adherence. Explained possible side effects of Penicillamine, including skin rash and gastrointestinal discomfort. Advised to report any unusual symptoms immediately. Follow-up visit scheduled after 4 weeks with liver function tests and 24-hour urinary copper analysis.\"}','2026-07-26','2026-07-26 11:54:13'),(20,12,10,'treatment_note','4-Week Treatment Follow-up','{\"main\":\"Patient has completed four weeks of copper-chelating therapy with good compliance. Symptoms of fatigue and abdominal discomfort have improved. Liver function tests show mild improvement, and there are no significant medication-related adverse effects. Patient continues to follow a low-copper diet and understands the importance of lifelong treatment.\",\"symptoms\":\"Mild hand tremors, occasional fatigue, improved appetite, reduced abdominal discomfort, no worsening neurological symptoms.\",\"prescription\":\"\",\"treatment_plan\":\"Continue Penicillamine 250 mg twice daily and Zinc acetate 50 mg three times daily. Maintain a low-copper diet and adequate hydration. Repeat liver function tests, complete blood count, kidney function tests, and 24-hour urinary copper estimation in three months. Continue regular follow-up with hepatology and neurology specialists.\",\"doctor_notes\":\"Patient is responding well to treatment with no evidence of disease progression. Reinforced the importance of medication adherence, dietary restrictions, and routine monitoring. Next follow-up scheduled after 8 weeks.\"}','2026-07-26','2026-07-26 11:56:22'),(21,12,10,'visit_history','Routine Follow-up Visit','{\"main\":\"Patient attended a scheduled follow-up visit for Wilson Disease management. Clinical examination showed stable vital signs with improved liver function compared to the previous visit. Neurological examination revealed only mild residual hand tremors. Medication compliance was excellent, and the patient reported following the recommended low-copper diet without difficulty. No new symptoms or complications were observed.\",\"symptoms\":\"\",\"prescription\":\"\",\"treatment_plan\":\"\",\"doctor_notes\":\"Patient remains clinically stable and is responding positively to treatment. Continue the current medication regimen and dietary recommendations. Repeat laboratory investigations before the next appointment and return for follow-up in three months or sooner if new symptoms develop.\"}','2026-07-26','2026-07-26 11:57:00'),(22,13,12,'diagnosis','nc kewkm','{\"main\":\"dkmewkm\",\"symptoms\":\"nedw cklemk\",\"prescription\":\"mqwedwkmdeo\",\"treatment_plan\":\"mewmfkempdkp;wl\",\"doctor_notes\":\"emdmklewm\"}',NULL,'2026-07-26 12:12:40');
/*!40000 ALTER TABLE `medical_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_codes`
--

DROP TABLE IF EXISTS `otp_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `role` enum('doctor','hospital') NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `attempts` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_otp_codes_email_role` (`email`,`role`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_codes`
--

LOCK TABLES `otp_codes` WRITE;
/*!40000 ALTER TABLE `otp_codes` DISABLE KEYS */;
INSERT INTO `otp_codes` VALUES (2,'priya@doctor.com','314091','doctor','2026-08-27 15:00:44',0,'2026-08-27 14:50:43',0),(6,'bogaharini6apollo@gmail.com','888543','hospital','2026-08-28 15:39:26',1,'2026-08-28 15:29:25',0),(13,'h06791757@gmail.com','555399','doctor','2026-09-05 04:05:48',1,'2026-09-05 03:55:47',0),(15,'bogaharini6@gmail.com','712654','hospital','2026-09-05 10:13:28',1,'2026-09-05 10:03:28',0);
/*!40000 ALTER TABLE `otp_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient_diseases`
--

DROP TABLE IF EXISTS `patient_diseases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient_diseases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `disease_id` int DEFAULT NULL,
  `diagnosed_by` int DEFAULT NULL,
  `diagnosed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `disease_id` (`disease_id`),
  KEY `diagnosed_by` (`diagnosed_by`),
  CONSTRAINT `patient_diseases_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `patient_diseases_ibfk_2` FOREIGN KEY (`disease_id`) REFERENCES `rare_diseases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `patient_diseases_ibfk_3` FOREIGN KEY (`diagnosed_by`) REFERENCES `doctors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient_diseases`
--

LOCK TABLES `patient_diseases` WRITE;
/*!40000 ALTER TABLE `patient_diseases` DISABLE KEYS */;
INSERT INTO `patient_diseases` VALUES (1,2,1,1,'2026-07-01 08:53:31','Confirmed via genetic testing. Started ERT.'),(2,2,3,1,'2026-07-01 09:26:13',''),(3,3,3,1,'2026-07-04 10:27:39',''),(4,4,4,1,'2026-07-08 18:12:45',''),(5,5,1,1,'2026-07-09 09:57:02',''),(6,3,4,1,'2026-07-09 11:49:24',''),(8,8,1,1,'2026-07-21 04:42:32',''),(9,12,2,10,'2026-07-26 11:48:56',''),(10,13,3,12,'2026-07-26 12:12:18','');
/*!40000 ALTER TABLE `patient_diseases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patients`
--

DROP TABLE IF EXISTS `patients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hospital_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `contact` varchar(20) DEFAULT NULL,
  `address` text,
  `blood_group` varchar(5) DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by_doctor` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_patients_hospital` (`hospital_id`),
  KEY `idx_patients_created_by` (`created_by_doctor`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`hospital_id`) REFERENCES `hospitals` (`id`),
  CONSTRAINT `patients_ibfk_2` FOREIGN KEY (`created_by_doctor`) REFERENCES `doctors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patients`
--

LOCK TABLES `patients` WRITE;
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` VALUES (1,1,'Ramesh Kumar','1990-05-12','Male','9988776655','45 Park Road, Pune','O+','9988770000','2026-06-30 15:48:39',1,NULL),(2,1,'Ramesh Kumar Updated','1990-05-12','Male','9988776655','45 Park Road, Pune','O+','9988770000','2026-06-30 15:48:47',1,NULL),(3,1,'Ritik Mishra','2026-07-04','Male','9988776655','Sangvi Evana,Gajanan Niwas, gk marg road ,Lower Parel','A+','1234567888','2026-07-04 10:27:20',1,NULL),(4,1,'Bhavana Boga','2013-02-06','Female','9920546263','prabhadevi','o-','8898765423','2026-07-08 17:46:48',1,NULL),(5,1,'Arun Boga','2026-07-07','Male','9829656569','Lower Parel','AB+','9820656569','2026-07-09 09:49:34',1,NULL),(6,2,'Harini Boga','2026-07-03','Female','7021192565','Sangvi Evana,Gajanan Niwas, gk marg road ,Lower Parel','B+','9980765432','2026-07-14 14:01:28',1,NULL),(7,1,'Uma Boga','2026-07-18','Female','9930546263','Sangvi Evana,Gajanan Niwas, gk marg road ,Lower Parel','B+','9980765432','2026-07-18 09:41:49',1,NULL),(8,1,'RareSync',NULL,'Male','','','','','2026-07-20 08:08:13',1,'2026-09-05 10:10:02'),(12,2,'Rohan Redkar','2026-07-26','Male','9988776655','Lower Parel','AB+','9980765432','2026-07-26 11:48:28',10,NULL),(13,5,'Rohan Redkar','2026-07-26','Male','9988776655','Lower Parel','AB+','9980765432','2026-07-26 12:06:11',12,NULL),(14,1,'Pratik Patil',NULL,'Male','','','','','2026-08-09 11:03:29',NULL,NULL),(15,4,'Ritik Mishra',NULL,'Male','','','','','2026-08-14 11:40:55',NULL,NULL);
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rare_diseases`
--

DROP TABLE IF EXISTS `rare_diseases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rare_diseases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `symptoms` text,
  `treatment_overview` text,
  `icd_code` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rare_diseases`
--

LOCK TABLES `rare_diseases` WRITE;
/*!40000 ALTER TABLE `rare_diseases` DISABLE KEYS */;
INSERT INTO `rare_diseases` VALUES (1,'Gaucher Disease','A rare inherited metabolic disorder where fatty substances accumulate in cells and organs.','Enlarged spleen and liver, fatigue, anemia, bone pain, easy bruising','Enzyme replacement therapy (ERT), substrate reduction therapy','E75.22','2026-07-01 07:38:44'),(2,'Wilson Disease','A rare genetic disorder causing copper to accumulate in organs.','Liver disease, neurological problems, psychiatric symptoms, Kayser-Fleischer rings in eyes','Copper chelation therapy with penicillamine or trientine','E83.01','2026-07-01 08:47:33'),(3,'Pompe Disease','Pompe disease is a rare inherited genetic disorder caused by the buildup of glycogen in the body\'s cells due to deficiency of the enzyme acid alpha-glucosidase (GAA). It mainly affects muscles and the heart.','Muscle weakness, Difficulty walking, Fatigue, Breathing problems, Enlarged heart, Difficulty swallowing\n','Treatment includes enzyme replacement therapy (ERT), respiratory support, physical therapy, nutritional management, and regular monitoring by specialists.\n','E74.02','2026-07-01 09:23:35'),(4,'Fabry Disease','Fabry disease is a rare inherited genetic disorder caused by the deficiency of the enzyme alpha-galactosidase A. This leads to the buildup of fatty substances in blood vessels and organs, affecting the kidneys, heart, nervous system, and skin.','Burning pain in hands and feet, Heat intolerance, Decreased sweating, Skin rash (angiokeratomas), Abdominal pain, Hearing loss, Kidney problems, Heart disease, Fatigue','Treatment includes enzyme replacement therapy (ERT), oral chaperone therapy for eligible patients, pain management, and regular monitoring of kidney, heart, and nervous system function.','E75.21','2026-07-08 18:05:43');
/*!40000 ALTER TABLE `rare_diseases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `specialist_requests`
--

DROP TABLE IF EXISTS `specialist_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `specialist_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `requested_by` int NOT NULL,
  `specialist_id` int NOT NULL,
  `patient_id` int NOT NULL,
  `opinion_type` varchar(100) NOT NULL,
  `message` text,
  `status` enum('Pending','Accepted','Declined') DEFAULT 'Pending',
  `access_request_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `requested_by` (`requested_by`),
  KEY `specialist_id` (`specialist_id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `specialist_requests_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `collaboration_rooms` (`id`),
  CONSTRAINT `specialist_requests_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `doctors` (`id`),
  CONSTRAINT `specialist_requests_ibfk_3` FOREIGN KEY (`specialist_id`) REFERENCES `doctors` (`id`),
  CONSTRAINT `specialist_requests_ibfk_4` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `specialist_requests`
--

LOCK TABLES `specialist_requests` WRITE;
/*!40000 ALTER TABLE `specialist_requests` DISABLE KEYS */;
INSERT INTO `specialist_requests` VALUES (1,1,1,2,13,'Second Opinion','','Accepted',33,'2026-08-16 11:50:51','2026-08-16 11:51:35'),(2,3,1,2,1,'Diagnosis Review','','Pending',34,'2026-08-29 02:51:05',NULL);
/*!40000 ALTER TABLE `specialist_requests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-05 15:52:56
