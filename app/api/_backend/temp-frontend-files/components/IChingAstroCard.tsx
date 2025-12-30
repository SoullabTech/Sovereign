"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Sparkles, Compass, Zap } from "lucide-react";

interface TrigramArchetype {
  name: string;
  symbol: string;
  element: string;
  direction: string;
  attribute: string;
  archetype: string;
  description: string;
  keywords: string[];
}

interface IChingAstroProfile {
  baseNumber: number;
  birthTrigram: string;
  birthElement: string;
  currentTrigramCycle: string;
  hexagramMapping: string[];
  currentYearNumber: number;
  cyclePosition: string;
  fractalPhase: string;
  yearlyGuidance: string;
}

interface IChingCompatibility {
  compatibility: number;
  description: string;
}

interface IChingAstroCardProps {
  profile: IChingAstroProfile;
  birthArchetype?: TrigramArchetype;
  currentArchetype?: TrigramArchetype;
  compatibility?: IChingCompatibility;
}

const elementColors = {
  Wood: "bg-green-100 text-green-800 border-green-200",
  Fire: "bg-red-100 text-red-800 border-red-200",
  Earth: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Metal: "bg-gray-100 text-gray-800 border-gray-200",
  Water: "bg-blue-100 text-blue-800 border-blue-200",
};

const symbolColors = {
  Wood: "text-green-600",
  Fire: "text-red-600",
  Earth: "text-yellow-600",
  Metal: "text-gray-600",
  Water: "text-blue-600",
};

export default function IChingAstroCard({
  profile,
  birthArchetype,
  currentArchetype,
  compatibility,
}: IChingAstroCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showHexagrams, setShowHexagrams] = useState(false);

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <Card className="w-full bg-gradient-to-br from-amber-50 via-blue-50 to-indigo-50 border-amber-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Sparkles className="h-6 w-6 text-amber-600" />
            <div>
              <CardTitle className="text-xl text-gray-900">
                I Ching Astrology Profile
              </CardTitle>
              <CardDescription className="text-gray-600">
                Trigram archetypes and fractal timing
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-amber-600 hover:text-amber-700"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Birth Trigram Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Compass className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold text-gray-900">Birth Trigram</h3>
            </div>

            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-3xl ${symbolColors[profile.birthElement as keyof typeof symbolColors]}`}
                  >
                    {birthArchetype?.symbol || "☰"}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {profile.birthTrigram}
                    </div>
                    <div className="text-sm text-gray-600">
                      {birthArchetype?.archetype}
                    </div>
                  </div>
                </div>
                <Badge
                  className={
                    elementColors[
                      profile.birthElement as keyof typeof elementColors
                    ]
                  }
                >
                  {profile.birthElement}
                </Badge>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                <strong>Base Number:</strong> {profile.baseNumber} •{" "}
                <strong>Direction:</strong> {birthArchetype?.direction}
              </div>

              {birthArchetype && (
                <div className="text-sm text-gray-700">
                  {birthArchetype.description}
                </div>
              )}
            </div>
          </div>

          {/* Current Year Section */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-indigo-600" />
              <h3 className="font-semibold text-gray-900">
                Current Year Energy
              </h3>
            </div>

            <div className="bg-white rounded-lg p-4 border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-3xl ${symbolColors[currentArchetype?.element as keyof typeof symbolColors] || "text-gray-600"}`}
                  >
                    {currentArchetype?.symbol || "☰"}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {profile.currentTrigramCycle}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentArchetype?.archetype}
                    </div>
                  </div>
                </div>
                <Badge
                  className={
                    elementColors[
                      currentArchetype?.element as keyof typeof elementColors
                    ] || "bg-gray-100"
                  }
                >
                  {currentArchetype?.element || "Unknown"}
                </Badge>
              </div>

              <div className="text-sm text-gray-600 mb-2">
                <strong>Year Number:</strong> {profile.currentYearNumber} •{" "}
                <strong>Phase:</strong> {profile.cyclePosition}
              </div>

              <div className="text-sm text-gray-700">
                {profile.fractalPhase}
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility Section */}
        {compatibility && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">
              Birth vs Current Year Harmony
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityColor(compatibility.compatibility)}`}
                >
                  {compatibility.compatibility}% Compatible
                </div>
                <span className="text-sm text-gray-600">
                  {compatibility.description}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Yearly Guidance */}
        <div className="bg-gradient-to-r from-amber-50 to-indigo-50 rounded-lg p-4 border border-amber-100">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-amber-600" />
            Yearly Guidance
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {profile.yearlyGuidance}
          </p>
        </div>

        {expanded && (
          <>
            <Separator />

            {/* Keywords */}
            {birthArchetype?.keywords && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Core Qualities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {birthArchetype.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Hexagram Mappings */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Associated Hexagrams
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHexagrams(!showHexagrams)}
                  className="text-xs"
                >
                  {showHexagrams ? "Hide" : "Show"} Hexagrams
                </Button>
              </div>

              {showHexagrams && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {profile.hexagramMapping.map((hexagram, index) => (
                      <div key={index} className="text-sm text-gray-700 py-1">
                        {hexagram}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Detailed Attributes */}
            {birthArchetype && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">
                    Trigram Attributes
                  </h5>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Attribute:</strong> {birthArchetype.attribute}
                    </div>
                    <div>
                      <strong>Direction:</strong> {birthArchetype.direction}
                    </div>
                    <div>
                      <strong>Element:</strong> {birthArchetype.element}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">
                    Cycle Information
                  </h5>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Base Number:</strong> {profile.baseNumber}/9
                    </div>
                    <div>
                      <strong>Position:</strong> {profile.cyclePosition}
                    </div>
                    <div>
                      <strong>Phase:</strong>{" "}
                      {profile.fractalPhase.split(" -")[0]}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
