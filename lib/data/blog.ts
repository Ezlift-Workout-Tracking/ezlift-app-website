import { BlogPost } from "@/types/blog";

export const blogPosts: BlogPost[] = [
  {
    slug: "tracking",
    title: "Tracking your workouts is crucial for progress",
    excerpt: "Why tracking workout progress is essential",
    date: "2025-01-18",
    author: {
      name: "Mo Adly",
      image: "/team/mostafa-adly.webp",
      role: "Personal trainer",
    },
    content: `
**Tracking your workouts either with an App or notebook is essential for making progress.**!


You probably heard about progressive overload. In short: it's increasing your volume each week, this volume can be either sets, reps, weight or intensity. This prompts your body to grow more muscles.

In order to do progressive overload properly , you need to keep track of how many sets you did, how many reps and very importantly how intense did you do your sets. Was it easy you didn't feel anything and you felt like you can keep going or was it until failure. This is usually referred to as RPE.

RPE or  rating of perceived exertion, is a scale that measures repetitions in reserve (RIR) during a set.  In the table below you can see the different RPE rating and their meanings.

|RPE Score|RIR/Description|
|-|-|
|10|  Max effort / failure|
|9|1 rep before failure|
|8|2 reps before failure|
|7|3 reps before failure|
|6|4 reps before failure|

<br/>

The most basic way to implement RPE is to simply replace percentage-based load prescription with RPE-based load prescription. For example, instead of programming 4 sets of 8 at 70% on a compound movement, you could program 4 sets of 8 at 6-8 RPE. This means that you would simply choose a load that would land you within the 6-8 RPE range

You can simply log that each time in your notebook when you're in the gym and try to beat it the week after. You don't need to increase the weight each time, but you want to increase something. This can be weight, reps, sets or RPE. 

  
Most of the apps I used don't have RPE tracking. That's why I implemented this in Ezlift. I needed some sort of a way to know my RPE of the week , so I can beat it next week.


    
    `,
  },
];
