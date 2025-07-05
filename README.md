# EZLift App Website

A modern fitness app landing page built with Next.js, featuring a Contentful-powered blog.

## Features

- 🏋️ Fitness app landing page
- 📝 Dynamic blog powered by Contentful CMS
- 🎨 Beautiful UI with Tailwind CSS and shadcn/ui
- 📱 Fully responsive design
- ⚡ Fast performance with Next.js
- 🔍 SEO optimized

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Contentful account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/ezlift-app-website.git
cd ezlift-app-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Contentful credentials in `.env.local`:
```
CONTENTFUL_SPACE_ID=your_contentful_space_id
CONTENTFUL_ACCESS_TOKEN=your_contentful_access_token
CONTENTFUL_PREVIEW_ACCESS_TOKEN=your_contentful_preview_access_token
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Contentful Setup

### Content Model: Blog Post

Create a content model in Contentful with the following fields:

1. **Title** (Short text)
   - Field ID: `title`
   - Required: Yes

2. **Slug** (Short text)
   - Field ID: `slug`
   - Required: Yes
   - Unique: Yes
   - Appearance: Slug

3. **Author** (Reference)
   - Field ID: `author`
   - Required: Yes
   - Reference to: Author content type

4. **Publish Date** (Date & time)
   - Field ID: `publishDate`
   - Required: Yes

5. **Excerpt** (Long text)
   - Field ID: `excerpt`
   - Required: Yes

6. **Content** (Rich text)
   - Field ID: `content`
   - Required: Yes

7. **Cover Image** (Media)
   - Field ID: `coverImage`
   - Required: No

### Content Model: Author

Create an Author content model with:

1. **Name** (Short text)
   - Field ID: `name`
   - Required: Yes

2. **Role** (Short text)
   - Field ID: `role`
   - Required: Yes

3. **Image** (Media)
   - Field ID: `image`
   - Required: No

## Deployment

### Environment Variables

Make sure to set these environment variables in your deployment platform:

- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ACCESS_TOKEN`
- `CONTENTFUL_PREVIEW_ACCESS_TOKEN` (optional, for preview mode)

### Build

```bash
npm run build
```

The site will be statically generated with ISR (Incremental Static Regeneration) for optimal performance.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── blog/              # Blog pages
│   ├── (legal)/           # Legal pages
│   └── ...
├── components/            # React components
│   ├── blog/             # Blog-specific components
│   ├── cards/            # Card components
│   ├── forms/            # Form components
│   └── ...
├── lib/                  # Utility functions
│   ├── contentful.ts     # Contentful API functions
│   └── ...
└── public/               # Static assets
```

## Technologies Used

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **CMS**: Contentful
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Rich Text**: Contentful Rich Text Renderer

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.