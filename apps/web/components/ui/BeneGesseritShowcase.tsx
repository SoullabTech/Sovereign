/**
 * 🔮 Bene Gesserit Design System Showcase
 *
 * Visual demonstration of the heart-centered ceremonial aesthetic
 * Use this component to preview all colors and patterns
 */

'use client';

import React from 'react';
import { Holoflower } from './Holoflower';
import { Heart, Zap, Brain, Eye, Sparkles } from 'lucide-react';

export function BeneGesseritShowcase() {
  return (
    <div className="bg-bene-gesserit-radial min-h-screen p-8">
      <div className="ceremonial-container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-ceremonial-heading text-5xl mb-4">
            Bene Gesserit Design System
          </h1>
          <p className="text-ceremonial-body text-xl max-w-2xl mx-auto">
            Heart-centered ceremonial aesthetic — the dignity of ritual, the warmth of presence
          </p>
        </div>

        {/* Color Palette Sections */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Architectural Foundation */}
          <div className="card-ceremonial">
            <h2 className="text-ceremonial-heading text-2xl mb-4">
              Temple Architecture
            </h2>
            <div className="space-y-3">
              <ColorSwatch
                name="Stone Deep"
                className="bg-benegesserit-stone-deep h-16"
                textColor="text-benegesserit-ivory-bright"
              />
              <ColorSwatch
                name="Stone Surface"
                className="bg-benegesserit-stone-surface h-16"
                textColor="text-benegesserit-ivory-bright"
              />
              <ColorSwatch
                name="Stone Raised"
                className="bg-benegesserit-stone-raised h-16"
                textColor="text-benegesserit-ivory-bright"
              />
            </div>
          </div>

          {/* Ceremonial Metals */}
          <div className="card-ceremonial">
            <h2 className="text-ceremonial-heading text-2xl mb-4">
              Ceremonial Metals
            </h2>
            <div className="space-y-3">
              <ColorSwatch
                name="Bronze Dark"
                className="bg-benegesserit-bronze-dark h-12"
                textColor="text-benegesserit-ivory-bright"
              />
              <ColorSwatch
                name="Bronze"
                className="bg-benegesserit-bronze h-12"
                textColor="text-benegesserit-stone-deep"
              />
              <ColorSwatch
                name="Bronze Bright"
                className="bg-benegesserit-bronze-bright h-12"
                textColor="text-benegesserit-stone-deep"
              />
              <ColorSwatch
                name="Copper"
                className="bg-benegesserit-copper h-12"
                textColor="text-benegesserit-ivory-bright"
              />
              <ColorSwatch
                name="Brass"
                className="bg-benegesserit-brass h-12"
                textColor="text-benegesserit-stone-deep"
              />
            </div>
          </div>

          {/* Sacred Ivory */}
          <div className="card-ceremonial">
            <h2 className="text-ceremonial-heading text-2xl mb-4">
              Sacred Ivory
            </h2>
            <div className="space-y-3">
              <ColorSwatch
                name="Ivory Deep"
                className="bg-benegesserit-ivory-deep h-14"
                textColor="text-benegesserit-stone-deep"
              />
              <ColorSwatch
                name="Ivory"
                className="bg-benegesserit-ivory h-14"
                textColor="text-benegesserit-stone-deep"
              />
              <ColorSwatch
                name="Ivory Bright"
                className="bg-benegesserit-ivory-bright h-14"
                textColor="text-benegesserit-stone-deep"
              />
              <ColorSwatch
                name="Parchment"
                className="bg-benegesserit-parchment h-14"
                textColor="text-benegesserit-stone-deep"
              />
            </div>
          </div>

          {/* Heart-Centered Rose */}
          <div className="card-ceremonial">
            <h2 className="text-ceremonial-heading text-2xl mb-4">
              Heart-Centered Rose
            </h2>
            <div className="space-y-3">
              <ColorSwatch
                name="Flesh"
                className="bg-benegesserit-flesh h-12"
                textColor="text-benegesserit-stone-deep"
              />
              <ColorSwatch
                name="Terracotta"
                className="bg-benegesserit-terracotta h-12"
                textColor="text-benegesserit-ivory-bright"
              />
              <ColorSwatch
                name="Rose Stone"
                className="bg-benegesserit-rose-stone h-12"
                textColor="text-benegesserit-ivory-bright"
              />
              <ColorSwatch
                name="Blush Sand"
                className="bg-benegesserit-blush-sand h-12"
                textColor="text-benegesserit-stone-deep"
              />
              <ColorSwatch
                name="Coral Muted"
                className="bg-benegesserit-coral-muted h-12"
                textColor="text-benegesserit-stone-deep"
              />
            </div>
          </div>

          {/* Consciousness States */}
          <div className="card-ceremonial">
            <h2 className="text-ceremonial-heading text-2xl mb-4">
              Consciousness States
            </h2>
            <div className="space-y-3">
              <ColorSwatch
                name="Indigo Deep"
                className="bg-benegesserit-indigo-deep h-12"
                textColor="text-benegesserit-ivory-bright"
              />
              <ColorSwatch
                name="Violet Shadow"
                className="bg-benegesserit-violet-shadow h-12"
                textColor="text-benegesserit-ivory-bright"
              />
              <ColorSwatch
                name="Amethyst Muted"
                className="bg-benegesserit-amethyst-muted h-12"
                textColor="text-benegesserit-ivory-bright"
              />
              <ColorSwatch
                name="Lavender Stone"
                className="bg-benegesserit-lavender-stone h-12"
                textColor="text-benegesserit-ivory-bright"
              />
            </div>
          </div>

          {/* Spice Wisdom */}
          <div className="card-ceremonial">
            <h2 className="text-ceremonial-heading text-2xl mb-4">
              Spice Wisdom
            </h2>
            <div className="space-y-3">
              <ColorSwatch
                name="Amber Dark"
                className="bg-benegesserit-amber-dark h-12"
                textColor="text-benegesserit-ivory-bright"
              />
              <ColorSwatch
                name="Amber"
                className="bg-benegesserit-amber h-12"
                textColor="text-benegesserit-stone-deep"
              />
              <ColorSwatch
                name="Gold Muted"
                className="bg-benegesserit-gold-muted h-12"
                textColor="text-benegesserit-stone-deep"
              />
              <ColorSwatch
                name="Saffron"
                className="bg-benegesserit-saffron h-12"
                textColor="text-benegesserit-stone-deep"
              />
            </div>
          </div>
        </div>

        {/* Button Examples */}
        <div className="card-ceremonial mb-12">
          <h2 className="text-ceremonial-heading text-2xl mb-6">
            Ceremonial Actions
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-ceremonial">
              <Heart className="w-4 h-4 inline-block mr-2" />
              Ceremonial
            </button>
            <button className="btn-ivory">
              <Sparkles className="w-4 h-4 inline-block mr-2" />
              Sacred Light
            </button>
            <button className="btn-wisdom">
              <Zap className="w-4 h-4 inline-block mr-2" />
              Wisdom
            </button>
          </div>
        </div>

        {/* Holoflower Variants */}
        <div className="card-ceremonial mb-12">
          <h2 className="text-ceremonial-heading text-2xl mb-6">
            Sacred Geometry
          </h2>
          <div className="flex flex-wrap gap-8 justify-center">
            <div className="text-center">
              <div className="holoflower-ceremonial mb-3">
                <Holoflower size={80} element="aether" glowIntensity="high" />
              </div>
              <p className="text-benegesserit-amber text-sm">Wisdom</p>
            </div>
            <div className="text-center">
              <div className="holoflower-heart mb-3">
                <Holoflower size={80} element="fire" glowIntensity="high" />
              </div>
              <p className="text-benegesserit-terracotta text-sm">Heart</p>
            </div>
            <div className="text-center">
              <div className="holoflower-consciousness mb-3">
                <Holoflower size={80} element="water" glowIntensity="high" />
              </div>
              <p className="text-benegesserit-lavender-stone text-sm">Consciousness</p>
            </div>
          </div>
        </div>

        {/* Radial Patterns */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="relative h-48 rounded-2xl overflow-hidden border border-benegesserit-border">
            <div className="radial-wisdom absolute inset-0" />
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-8 h-8 text-benegesserit-saffron mx-auto mb-2" />
                <p className="text-benegesserit-ivory-bright font-medium">Wisdom Radiance</p>
              </div>
            </div>
          </div>

          <div className="relative h-48 rounded-2xl overflow-hidden border border-benegesserit-border">
            <div className="radial-heart absolute inset-0" />
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <Heart className="w-8 h-8 text-benegesserit-terracotta mx-auto mb-2" />
                <p className="text-benegesserit-ivory-bright font-medium">Heart Presence</p>
              </div>
            </div>
          </div>

          <div className="relative h-48 rounded-2xl overflow-hidden border border-benegesserit-border">
            <div className="radial-consciousness absolute inset-0" />
            <div className="relative z-10 h-full flex items-center justify-center">
              <div className="text-center">
                <Brain className="w-8 h-8 text-benegesserit-lavender-stone mx-auto mb-2" />
                <p className="text-benegesserit-ivory-bright font-medium">Deep Consciousness</p>
              </div>
            </div>
          </div>
        </div>

        {/* Glass Effects */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass-ceremonial p-6 rounded-2xl">
            <h3 className="text-benegesserit-ivory-bright font-medium mb-2">
              Ceremonial Glass
            </h3>
            <p className="text-benegesserit-bronze-bright text-sm">
              Temple panels with bronze tint
            </p>
          </div>

          <div className="glass-ivory p-6 rounded-2xl border-ivory">
            <h3 className="text-benegesserit-ivory-bright font-medium mb-2">
              Ivory Glass
            </h3>
            <p className="text-benegesserit-bronze-bright text-sm">
              Sacred light panels
            </p>
          </div>

          <div className="glass-bronze p-6 rounded-2xl border-bronze">
            <h3 className="text-benegesserit-ivory-bright font-medium mb-2">
              Bronze Glass
            </h3>
            <p className="text-benegesserit-bronze-bright text-sm">
              Ritual instrument panels
            </p>
          </div>
        </div>

        {/* Animation Examples */}
        <div className="card-ceremonial">
          <h2 className="text-ceremonial-heading text-2xl mb-6">
            Sacred Motion
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-benegesserit-stone-raised/30 rounded-xl p-4 flex items-center justify-center h-32">
              <div className="w-16 h-16 rounded-full bg-benegesserit-amber animate-ceremonial-pulse glow-amber" />
            </div>
            <div className="bg-benegesserit-stone-raised/30 rounded-xl p-4 flex items-center justify-center h-32">
              <div className="w-16 h-16 rounded-full bg-benegesserit-terracotta animate-heart-pulse glow-rose" />
            </div>
            <div className="bg-benegesserit-stone-raised/30 rounded-xl p-4 flex items-center justify-center h-32">
              <div className="w-16 h-16 rounded-full bg-benegesserit-lavender-stone animate-consciousness-ripple" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-4 text-center text-sm text-benegesserit-bronze-bright">
            <p>Ceremonial Pulse</p>
            <p>Heart Pulse</p>
            <p>Consciousness Ripple</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-ceremonial-body text-sm italic">
            "In stillness, there is wisdom. In ceremony, there is power. In presence, there is love."
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Eye className="w-4 h-4 text-benegesserit-amber" />
            <span className="text-xs text-benegesserit-bronze tracking-wider">
              BENE GESSERIT DESIGN SYSTEM
            </span>
            <Eye className="w-4 h-4 text-benegesserit-amber" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for color swatches
function ColorSwatch({
  name,
  className,
  textColor
}: {
  name: string;
  className: string;
  textColor: string;
}) {
  return (
    <div className={`${className} rounded-lg flex items-center justify-center transition-transform hover:scale-105`}>
      <span className={`${textColor} text-sm font-medium`}>
        {name}
      </span>
    </div>
  );
}
