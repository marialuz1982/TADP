-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 10-11-2025 a las 00:43:44
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `biblioteca`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `libros`
--

CREATE TABLE `libros` (
  `id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `autor` varchar(150) NOT NULL,
  `anio` int(11) DEFAULT NULL,
  `genero` varchar(100) DEFAULT NULL,
  `isbn` varchar(20) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Datos para la tabla `libros`
--

INSERT INTO `libros` (`id`, `titulo`, `autor`, `anio`, `genero`, `isbn`, `creado_en`) VALUES
(2, 'Rayuela', 'Julio Cortázar', 1963, 'Ficción', '', '2025-10-24 16:32:06'),
(3, '1984', 'George Orwell', 1949, 'Distopía', '', '2025-10-24 16:32:24'),
(4, 'Rayuela', 'Julio Cortázar', 1963, 'Ficción', '', '2025-10-24 16:32:24'),
(5, 'Alicia en el pais de las maravillas', 'Lewis Carroll', 1982, 'novela', '9789505812721', '2025-10-24 18:38:46'),
(8, 'El diario de Ana', 'Ana Frank', 1944, 'novela', '99789871263066', '2025-10-24 19:29:43');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `libros`
--
ALTER TABLE `libros`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `libros`
--
ALTER TABLE `libros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
