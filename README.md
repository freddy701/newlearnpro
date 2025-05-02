# NewLearnPro

NewLearnPro est une application web développée avec Next.js, conçue pour faciliter l'apprentissage en ligne. Elle offre une plateforme où les étudiants peuvent suivre des cours, participer à des groupes d'étude, et les enseignants peuvent créer et gérer leurs cours.

## Fonctionnalités Principales

- **Gestion des Cours** : Les enseignants peuvent créer, modifier et publier des cours. Les étudiants peuvent s'inscrire à ces cours et suivre leur progression.
- **Quiz Interactifs** : Chaque leçon peut inclure des quiz pour évaluer la compréhension des étudiants.
- **Groupes d'Étude** : Les étudiants peuvent rejoindre des groupes d'étude pour collaborer et échanger des idées.
- **Paiements Sécurisés** : Intégration avec Stripe pour gérer les paiements des cours.
- **Authentification** : Utilisation de NextAuth pour sécuriser l'accès à l'application.

## Technologies Utilisées

- **Next.js** : Framework React pour le développement de l'application.
- **Prisma** : ORM pour interagir avec la base de données.
- **Stripe** : Gestion des paiements en ligne.
- **Tailwind CSS** : Framework CSS pour le design et la mise en page.

## Démarrage

Pour démarrer le serveur de développement, exécutez :

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
