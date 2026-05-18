import React from "react";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeatureSection";
import HowToUseSection from "../components/HowToUseSection";
import AboutSection from "../components/AboutSection";
const LandingPage = () => {
  return (
    <div className="relative">
      {/* SHADOW CIRCLE */}
      {/* <div className="hidden md:flex absolute top-[-300px] left-[35%] w-120 h-120 rounded-full bg-blue-500 blur-3xl opacity-40"></div>
       */}
      {/* hero section */}
      <HeroSection />
      <FeaturesSection />
      <HowToUseSection />
      <AboutSection />
    </div>
  );
};

export default LandingPage;
