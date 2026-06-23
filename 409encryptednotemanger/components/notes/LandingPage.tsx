"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Lock,
  PenSquare,
  Shield,
  ArrowRight,
  Sparkles,
  Github,
  Zap,
  Key,
  Cloud,
  FileText,
  Eye,
  Users,
  GraduationCap,
  Star,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const contributors = [
    {
      name: "Daramola Olalekan Praise",
      role: "Lead Developer & Technical Lead",
      contributions:
        "Authentication System, Encryption Implementation, Full-stack Integration, Rust Backend Architecture",
      icon: "👑",
      color: "from-yellow-400 to-amber-500",
      badge: "Team Lead",
      highlight: true,
    },
    {
      name: "OGBONAYA CONFIDENCE",
      role: "UI/UX Developer",
      contributions:
        "UI Design System, Figma Prototypes, Component Architecture, Responsive Design",
      icon: "🎨",
      color: "from-purple-400 to-pink-500",
      badge: "Design Lead",
      highlight: true,
    },
    {
      name: "ODU HANNNA BOLUWATIFE",
      role: "Frontend Developer",
      contributions:
        "Next.js Implementation, State Management, Client-side Integration, UI Components",
      icon: "⚛️",
      color: "from-blue-400 to-cyan-500",
      badge: "Frontend",
      highlight: true,
    },
    {
      name: "AWOPEJU ABIODUN OLUWASEYI",
      role: "Backend Developer",
      contributions:
        "Rust API Development, MongoDB Integration, Encryption Services, Server Architecture",
      icon: "🦀",
      color: "from-orange-400 to-red-500",
      badge: "Backend",
      highlight: true,
    },
    {
      name: "OLUBUNMI OYINIJESU FAVOR",
      role: "GitHub Project Manager",
      contributions:
        "Repository Management, Version Control, Code Review Coordination, Documentation",
      icon: "📊",
      color: "from-green-400 to-emerald-500",
      badge: "DevOps",
      highlight: true,
    },
    {
      name: "ODUNFA TEMITOPE JOSHUA",
      role: "Project Researcher",
      contributions:
        "Technical Research, Security Analysis, Requirement Gathering, Documentation",
      icon: "🔍",
      color: "from-indigo-400 to-purple-500",
      badge: "Research",
      highlight: true,
    },
    {
      name: "DANIEL-UVOH DONALD OLAMIDE",
      role: "Assistant Researcher",
      contributions:
        "Market Analysis, User Research, Testing Coordination, Documentation Support",
      icon: "📝",
      color: "from-teal-400 to-green-500",
      badge: "Research",
      highlight: true,
    },
  ];

  const courseInfo = {
    code: "CSC 409",
    title: "Software Engineering",
    session: "2025/2026",
    group: "Group 13-A",
  };

  // Features data
  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Level Security",
      description:
        "Your notes are encrypted with AES-256-GCM, the same standard used by banks.",
      color: "from-purple-500 to-pink-500",
      delay: 0.1,
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description:
        "Built with Rust and Next.js for instant loads and smooth interactions.",
      color: "from-blue-500 to-cyan-500",
      delay: 0.2,
    },
    {
      icon: <Key className="w-8 h-8" />,
      title: "You Own the Keys",
      description:
        "Only you can decrypt your notes. We never see your content.",
      color: "from-green-500 to-emerald-500",
      delay: 0.3,
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Secure Sync",
      description: "Access your notes anywhere with end-to-end encrypted sync.",
      color: "from-orange-500 to-red-500",
      delay: 0.4,
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Rich Formatting",
      description:
        "Markdown support with real-time preview and syntax highlighting.",
      color: "from-indigo-500 to-purple-500",
      delay: 0.5,
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Privacy First",
      description: "No tracking, no analytics, no data collection. Ever.",
      color: "from-pink-500 to-rose-500",
      delay: 0.6,
    },
  ];

  return (
    <>
      <AnimatedBackground />

      {/* Course Info Banner */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-lg text-white py-2"
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="w-4 h-4" />
            <span className="font-medium">{courseInfo.code}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{courseInfo.title}</span>
            <span>•</span>
            <span>{courseInfo.group}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Project • {courseInfo.session}</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <section
        ref={containerRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-12"
      >
        {/* Floating elements */}
        <motion.div
          className="absolute top-20 left-10 text-primary/20"
          animate={{
            y: [0, 20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Lock size={60} />
        </motion.div>

        <motion.div
          className="absolute bottom-20 right-10 text-secondary/20"
          animate={{
            y: [0, -20, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Key size={80} />
        </motion.div>

        <div className="container mx-auto px-4 z-10">
          <motion.div
            style={{ y, opacity }}
            className="text-center max-w-5xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                End-to-End Encrypted • CSC 409 Project
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-6xl md:text-8xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Encrypted Notes
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                for the Paranoid
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto"
            >
              Your thoughts deserve the best protection. Military-grade
              encryption, beautiful interface, and the speed of Rust. Presented
              by{" "}
              <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CSC Group 13-A
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={onGetStarted}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
              >
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="group backdrop-blur-lg bg-white/10 border-white/20 hover:bg-white/20 px-8 py-6 text-lg rounded-full"
                onClick={() =>
                  window.open(
                    "https://github.com/Daradev1/encrypted-Note-Manager",
                    "_blank",
                  )
                }
              >
                <Github className="mr-2 w-5 h-5" />
                View on GitHub
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
            >
              {[
                { value: "256-bit", label: "Encryption" },
                { value: "100%", label: "Open Source" },
                { value: "0", label: "Trackers" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mt-2" />
          </div>
        </motion.div>
      </section>

      {/* Contributors Section - UPDATED with better styling */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Meet the Team
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built with ❤️ by CSC Group 13-A
            </p>
          </motion.div>

          {/* Team Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
            <div className="text-center p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                7
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Team Members
              </div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                4
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Developers
              </div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                3
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Support Team
              </div>
            </div>
          </div>

          {/* Contributors Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {contributors.map((contributor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                {/* Glow effect for highlighted contributors */}
                {contributor.highlight && (
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${contributor.color} rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-300`}
                  />
                )}

                <Card
                  className={`relative p-6 backdrop-blur-lg ${
                    contributor.highlight
                      ? "bg-gradient-to-br from-white/90 to-white/80 dark:from-gray-800/90 dark:to-gray-900/90 border-2 border-transparent bg-clip-padding"
                      : "bg-white/70 dark:bg-gray-900/70 border-white/20"
                  }`}
                >
                  {/* Role badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium bg-gradient-to-r ${contributor.color} text-white shadow-lg`}
                    >
                      {contributor.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    {/* Icon/Avatar */}
                    <div
                      className={`relative w-16 h-16 rounded-2xl bg-gradient-to-r ${contributor.color} p-4 flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="relative z-10">{contributor.icon}</span>
                      <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all duration-300">
                        {contributor.name}
                      </h3>
                      <p
                        className={`text-sm font-medium mb-2 bg-gradient-to-r ${contributor.color} bg-clip-text text-transparent`}
                      >
                        {contributor.role}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {contributor.contributions}
                      </p>
                    </div>
                  </div>

                  {/* Contribution tags */}
                  <div className="mt-4 flex flex-wrap gap-1">
                    {contributor.contributions
                      .split(", ")
                      .slice(0, 2)
                      .map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-[10px] text-gray-600 dark:text-gray-300"
                        >
                          {item.length > 15
                            ? item.substring(0, 15) + "..."
                            : item}
                        </span>
                      ))}
                  </div>

                  {/* Hover effect line */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${contributor.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl`}
                  />
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Team Lead Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400/20 to-amber-400/20 backdrop-blur-lg border border-yellow-400/30 rounded-full px-6 py-3">
              <span className="text-2xl">👑</span>
              <span className="text-sm font-medium">
                Project Lead:{" "}
                <span className="text-yellow-400 font-bold">
                  Daramola Olalekan Praise
                </span>
              </span>
            </div>
          </motion.div>

          {/* Group Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600/10 to-pink-600/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">
                CSC 409 - Software Engineering • Project • Group 13-A
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Why Choose Us?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We combine cutting-edge security with a seamless user experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative"
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color.split(" ")[1]}, ${feature.color.split(" ")[3]})`,
                  }}
                />
                <Card className="relative p-8 backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border-2 border-transparent hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${feature.color} rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity`}
                  />
                  <div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-6`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Ready to Get Started?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
              Join CSC Group 13-A in revolutionizing secure note-taking.
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-6 text-xl rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-3">
                Create Your First Encrypted Note
                <Sparkles className="w-6 h-6" />
              </span>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 CSC 409 Group 13-A. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              Built with Rust • Next.js • MongoDB
            </p>
            <p className="text-sm text-gray-500">
              Lead Contributor:{" "}
              <span className="text-purple-400 font-medium">
                Daramola Olalekan Praise
              </span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
