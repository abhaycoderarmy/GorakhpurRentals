import { useEffect, useState } from "react";
import HeroSection from "./Home/HetroSection";
import BrandShowcase from "./Home/BrandShowcase";
import OurRentalProcess from "./Home/OurRentalProcess";
import RentForACause from "./Home/RentForACause";
import Footer from "../components/Footer";
import InstagramPost from "./Home/InstagramPost";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Brand Showcase */}
      <BrandShowcase />
      
      {/* Our Rental Process */}
      <OurRentalProcess />
      
      {/* Rent for a Cause */}
      <RentForACause />

      {/* Instagram Post Section */}
      <InstagramPost />

      <Footer />
    </div>
  );
}