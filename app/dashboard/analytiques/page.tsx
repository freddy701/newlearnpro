"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { LucideBarChart2, LucideCalendar, LucideClock, LucideAward, LucideBookOpen } from "lucide-react";

export default function Analytiques() {
  const { data: session } = useSession();

  // Données d'exemple pour les statistiques d'apprentissage
  const statistiques = {
    tempsTotal: "28h 45min",
    coursCompletes: 2,
    leçonsCompletes: 15,
    tauxCompletion: 68,
    streakJours: 5,
    activiteRecente: [
      { date: "15 Avr", minutes: 120 },
      { date: "14 Avr", minutes: 90 },
      { date: "13 Avr", minutes: 60 },
      { date: "12 Avr", minutes: 75 },
      { date: "11 Avr", minutes: 45 },
      { date: "10 Avr", minutes: 0 },
      { date: "9 Avr", minutes: 30 },
    ],
    progressionCours: [
      { id: 1, titre: "Introduction au développement web", progression: 35 },
      { id: 2, titre: "JavaScript moderne", progression: 20 },
    ]
  };

  // Fonction pour obtenir la couleur en fonction du temps d'étude
  const getActivityColor = (minutes: number) => {
    if (minutes === 0) return "bg-gray-200 dark:bg-gray-700";
    if (minutes < 30) return "bg-green-200 dark:bg-green-900";
    if (minutes < 60) return "bg-green-300 dark:bg-green-800";
    if (minutes < 90) return "bg-green-400 dark:bg-green-700";
    return "bg-green-500 dark:bg-green-600";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Analytiques</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Temps total d'apprentissage */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-3 mr-4">
              <LucideClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Temps d&apos;apprentissage</h3>
              <p className="text-2xl font-bold">{statistiques.tempsTotal}</p>
            </div>
          </div>
        </div>

        {/* Cours complétés */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
              <LucideBookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Leçons complétées</h3>
              <p className="text-2xl font-bold">{statistiques.leçonsCompletes}</p>
            </div>
          </div>
        </div>

        {/* Taux de complétion */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mr-4">
              <LucideAward className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de complétion</h3>
              <p className="text-2xl font-bold">{statistiques.tauxCompletion}%</p>
            </div>
          </div>
        </div>

        {/* Streak de jours */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-4">
            <div className="rounded-full bg-orange-100 dark:bg-orange-900 p-3 mr-4">
              <LucideCalendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Jours consécutifs</h3>
              <p className="text-2xl font-bold">{statistiques.streakJours} jours</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité récente */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-6">Activité des 7 derniers jours</h3>
          <div className="flex items-end justify-between h-40">
            {statistiques.activiteRecente.map((jour, index) => (
              <div key={index} className="flex flex-col items-center w-1/8">
                <div 
                  className={`w-8 ${getActivityColor(jour.minutes)}`}
                  style={{ 
                    height: `${Math.max(jour.minutes / 2, 5)}px`,
                    minHeight: '5px'
                  }}
                ></div>
                <span className="text-xs mt-2 text-gray-500 dark:text-gray-400">{jour.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progression des cours */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-6">Progression des cours</h3>
          <div className="space-y-6">
            {statistiques.progressionCours.map((cours) => (
              <div key={cours.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {cours.titre}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {cours.progression}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${cours.progression}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
