import { Link } from "wouter";
import HeroSection from "@/components/home/HeroSection";
import ServiceCard from "@/components/home/ServiceCard";
import InformationSection from "@/components/home/InformationSection";
import { SERVICES } from "@/lib/constants.jsx";
import { useState, useEffect } from 'react'
import supabase from '../config/supabase'

const Home = () => {
  console.log(import.meta.env.VITE_SUPABASE_URL);
  console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);


  return (
    <section id="home" className="pt-8 pb-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <HeroSection />

        {/* Services Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {SERVICES.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
            />
          ))}
        </div>

        {/* Information Section */}
        <InformationSection />
      </div>
    </section>
  );
};

export default Home;
