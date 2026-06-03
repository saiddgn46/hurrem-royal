import Takvim from './Takvim';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import Turnstile from 'react-turnstile';
import { supabase } from './supabase';
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Admin from './Admin';


const GOLD = "#C9A84C";
const CREAM = "#fdf6e3";
const DARK = "#2c1f0e";
const LIGHT_GOLD = "#f5d98b";

const styles = {};

const NAV_LINKS = ["Ana Sayfa", "Salon", "Paketler", "Galeri", "İletişim"];

const PAC