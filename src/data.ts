export const profile = {
  name: 'Abdullah Ehsan',
  affiliation: 'cs @ uwaterloo',
  introduction:
    'looking for summer 2027 internships.',
  email: 'mailto:a2ehsan@uwaterloo.ca',
  github: 'https://github.com/aehsan275',
  linkedin: 'https://www.linkedin.com/in/abdullah-ehsan-960425399/',
  x: 'https://x.com/abdullahehsn',
  calendar: 'https://cal.com/abdullah-ehsan/30min',
};

export const experience = {
  company: 'nexaquanta',
  summary: 'worked on agents and rag systems across two internships.',
  roles: [
    {
      title: 'software engineering intern',
      dates: 'aug to sep 2026',
      description:
        'worked on an agent that turns questions about uploaded datasets into data analyses. learned about how llms work and how big their potential is.',
    },
    {
      title: 'software engineering intern',
      dates: 'may to aug 2025',
      description:
        'built a rag system that retrieved relevant wikipedia passages to ground gemini responses. it was my first time having external responsibility and a glimpse into how the industry operates.',
    },
  ],
};

export const education = {
  institution: 'university of waterloo',
  program: 'computer science',
  dates: '2026–2031',
  reflection: 'uni math is so different from high school.',
  priorCourse: {
    institution: 'university of calgary',
    program: 'CPSC217',
    dates: 'summer 2025',
    reflection: 'took this purely for the love of the game, ended with 97%.',
  },
};

export const projects = [
  {
    id: 'mm-kinetics',
    details: [] as readonly string[],
    writeup: {
      subtitle: '',
      sections: [
        {
          title: 'starting with the reaction',
          equations: [
            {
              expression: 'E + S  ⇌  ES  →  E + P',
              note: 'E is enzyme · S is substrate · ES is the bound complex · P is product',
              afterParagraph: 2,
            },
            {
              expression: 'v = Vmax · [S] / (Km + [S])',
              note: 'v is reaction rate · Vmax is the maximum rate · Km is the half-saturation concentration',
              afterParagraph: 2,
            },
          ],
          paragraphs: [
            'my dad was reading a biochemistry paper when i noticed it, and that inspired me to start this project. i built mm kinetics in python to work with enzyme reactions and learn machine learning through a concrete problem. the project grew from implementing an equation into a pipeline that simulates reactions, fits curves, compares regression models, and estimates uncertainty.',
            'an enzyme speeds up a reaction by binding to a substrate and converting it into a product. i started with michaelis-menten kinetics, which describes how the reaction rate changes with substrate concentration. the rate rises as more substrate becomes available, then approaches a limit as the enzyme becomes saturated. the two parameters are vmax, the limiting rate, and km, the substrate concentration at half that rate.',
            'i also implemented a simulation that tracks free enzyme, substrate, the enzyme-substrate complex, and product over time. that gave me a second way to examine the reaction alongside the rate equation.',
          ],
          image: '/projects/mmkinetics/figure-1.png',
          imageAlt:
            'simulated concentrations over time: substrate declines slightly while product increases; free enzyme and the enzyme-substrate complex stay close to zero on this scale.',
          caption:
            'the mass-action simulation tracks concentrations over time. substrate decreases as product accumulates; the enzyme and enzyme-substrate complex remain near the bottom at this scale.',
        },
        {
          title: 'fitting the curve',
          paragraphs: [
            'the default run generates 100 enzymes and four substrates, producing 400 assays with ten concentration measurements each. i add noise to the simulated rates so that the fitting code works with imperfect observations. for one representative assay, i use scipy to estimate km and vmax from those measurements. the pipeline runs both an ordinary fit and a weighted fit that accounts for measurement uncertainty.',
          ],
          image: '/projects/mmkinetics/figure-2.png',
          imageAlt:
            'synthetic reaction-rate measurements and a fitted michaelis-menten curve; the rate rises with substrate concentration and approaches a plateau.',
          caption:
            'the dots are synthetic measurements from one assay; the line is the fitted michaelis-menten curve. the horizontal axis uses a logarithmic scale.',
          afterImage: [
            'a fitted curve gives one estimate of each parameter. i added bootstrapping to examine how those estimates change when the data changes. one method resamples the measured concentration-rate pairs; another generates new noisy observations around the fitted curve. the default run repeats each method 200 times.',
            'the resampled km estimates have a long upper tail, which makes the uncertainty visible even when the original curve looks convincing.',
          ],
          secondImage: '/projects/mmkinetics/figure-3.png',
          secondImageAlt:
            'bootstrap distributions for km and vmax, and a scatter plot of both estimates; km has a long right tail.',
          secondCaption:
            'paired-data bootstrap estimates for the same assay. km has a long upper tail, and the scatter plot shows how its estimates vary with vmax.',
        },
        {
          title: 'learning the ml workflow',
          paragraphs: [
            'learning the machine learning workflow was the hardest and most memorable part. i had to decide which information belonged in the inputs, how to compare models, and how to evaluate predictions on enzymes excluded from training.',
            'the default target is log10(km). inputs include assay conditions such as temperature and ph, along with enzyme and substrate descriptors. i exclude identifiers, measured reaction rates, and kinetic targets from the features. for this synthetic example, i train against the known generated parameters. the single-assay curve fit above is a separate demonstration.',
            'i split the data by enzyme, keeping all assays from each enzyme together. the default split assigns 40 enzymes to training and 20 each to validation, calibration, and testing. i compare a median baseline, linear regression, ridge regression, random forest, and gradient boosting using validation rmse. gradient boosting wins this run. i then train 40 bootstrap copies of that model on resampled training assays and use their median prediction.',
          ],
          image: '/projects/mmkinetics/figure-4.png',
          imageAlt:
            'validation error comparison for five models: gradient boosting has the lowest rmse, while the median baseline has the highest.',
          caption:
            'lower validation rmse is better. gradient boosting scores 0.066 log10 units, compared with 0.510 for the median baseline.',
        },
        {
          title: 'reading the results',
          paragraphs: [
            'the saved run reports a test rmse of 0.078 log10 units and an r-squared of 0.977 across 80 assays from 20 held-out enzymes. those results describe performance on synthetic data whose descriptors contain the relationships used to generate the targets. they do not establish performance on experimental enzyme data.',
            'i use the separate calibration set to construct prediction intervals. for each calibration enzyme, i take its largest absolute prediction error, then use the required ranked error to set the interval width. in the saved test set, the calibrated 95% intervals cover 96.25% of individual assay targets. they cover every assay within 95% of the test enzymes, or 19 out of 20.',
          ],
          image: '/projects/mmkinetics/figure-5.png',
          imageAlt:
            'predictions and synthetic targets across 80 test assays, with a shaded 95 percent prediction interval around each prediction.',
          caption:
            'predictions and known synthetic targets, ordered by target value. the shaded band is the calibrated 95% prediction interval; the observed values are synthetic.',
          afterImage: [
            'the project also accepts local sabio-rk exports containing reported kinetic parameters. that path does not supply raw reaction curves, so the fitting demonstrations still use synthetic data. enzymes remain separate across the default partitions, but some studies and enzyme families are shared. the current evaluation does not measure generalization to entirely new studies or families.',
          ],
        },
        {
          title: 'the bugs along the way',
          paragraphs: [
            'unit conversion caused an early bug. i initially appended converted values one field at a time. if a later conversion failed, earlier fields already had an extra entry, breaking alignment between the output columns and their rows. i changed the code to convert each row as a unit and insert missing values for the whole normalized row on failure. regression tests check that invalid units preserve row alignment.',
            'i also reused the validation set to calibrate intervals after selecting a model with it. that gave the same data two jobs. i introduced a separate calibration partition and added a regression test that changes its labels. the test checks that model selection and point predictions stay identical when calibration labels change.',
            'the interval calculation needed two further fixes. i replaced a quantile calculation with the required ranked residual. i then removed a shortcut that capped the rank at the largest available error. with fewer than 19 calibration enzymes, a 95% interval requires an unbounded result. the pipeline now preserves those infinite bounds and labels them in the outputs instead of reporting a finite interval the calibration data cannot support.',
            'through this project, i learnt how to build an ml workflow from data preparation through evaluation. comparing models was one part of it; choosing inputs, separating data, and checking uncertainty required their own work. i now have tests for the failures i encountered, alongside a configurable pipeline that saves predictions, fitted models, metrics, and figures.',
          ],
        },
      ],
    },
    title: 'mm kinetics',
    summary: 'fits enzyme reaction curves and estimates uncertainty.',
    description:
      'a python pipeline for fitting enzyme reaction curves and estimating the uncertainty in those fits.',
    detail:
      'uses michaelis–menten curve fitting, bootstrap intervals and regression models. examples use synthetic data. validation groups samples by enzyme and includes conformal prediction intervals.',
    tech: ['python', 'numpy', 'scipy', 'scikit-learn'],
    note: '',
    repository: 'https://github.com/aehsan275/mmkinetics',
  },
  {
    id: 'scrabble-solver',
    details: [] as readonly string[],
    writeup: {
      subtitle: '',
      sections: [
        {
          id: 'the-project',
          label: 'the project',
          title: 'the project',
          paragraphs: [
            'i built this python scrabble solver for a school project. it searches a dictionary of 279,496 words and shows the five highest-scoring moves it finds. the tricky part was getting a move to fit the board in both directions: every new tile can change a word across and a word down.',
            "while looking on google, i found andrew appel and guy jacobson's 1988 paper, the world's fastest scrabble program, and decided to try building a solver using its approach. i expected the paper to be difficult to read, so i was surprised by how much i understood. it introduced me to tries and recursive backtracking.",
          ],
          image: '/projects/scrabble/solver.jpg',
          imageAlt:
            'the scrabble solver interface with a populated board, rack RIF?AA?, and five suggested moves headed by SAFARIS for 94 points.',
          imageKind: 'screenshot',
          caption:
            'the solver suggests SAFARIS for 94 points using the rack RIF?AA?. question marks are blank tiles.',
        },
        {
          id: 'finding-moves',
          label: 'finding moves',
          title: 'finding moves that fit',
          paragraphs: [
            'instead of checking the whole dictionary against every square, the solver starts around empty squares next to existing tiles, called anchors. on an empty board it uses the centre square. for each anchor, it considers possible starting squares to its left, limited by the board edge and the number of rack tiles available.',
            'cross-checking was the part that fried my brain. a tile placed in a horizontal word can form a vertical word too. before searching, the program scans above and below each empty square and stores the letters that would make a valid crossing word. if there are no vertical neighbours, the set contains every letter. i had to be careful about the order of letters above and below the square; the scan above the square runs backwards, so i reverse those letters before checking the dictionary.',
          ],
        },
        {
          id: 'placement-bug',
          label: 'the bug',
          title: 'when a word ended up in the wrong place',
          paragraphs: [
            'one of the harder bugs was that the solver found words but put them in invalid positions. on an earlier version of the board above, it reported BOCAGE even though the placement overlapped existing letters. after an attempted fix, the debug output showed column numbers from -8 down to -13. python allows negative list indices, so an incorrect coordinate could point back into the board instead of immediately failing.',
            "the search built part of a word before the anchor, but the position used to place the finished word didn't consistently account for where that part started. i changed the search to consider starting squares explicitly and keep the coordinates of newly placed tiles. it checks board boundaries while searching and swaps coordinates back when recording vertical moves. keeping the new tiles separate also helps the scoring code avoid reusing premiums under existing tiles.",
          ],
        },
        {
          id: 'building-scoring',
          label: 'search and scoring',
          title: 'building and scoring a word',
          paragraphs: [
            "i load the word list into a trie. each node has a python dictionary mapping letters to child nodes and a boolean marking whether a word ends there. during the search, if there is no child for the next letter, that branch stops. the paper also describes compressing a trie into a directed acyclic word graph, or dawg; i kept the trie and didn't implement the compression.",
            'from a starting square, the solver works to the right through the trie. a letter placed on an empty square must be available on the rack and allowed by that square’s cross-check. the search removes the tile, explores the continuation, then puts it back before trying another letter. a blank can stand for a needed letter and scores zero. when it reaches a tile already on the board, it follows that letter without taking one from the rack. vertical moves use the same search on a transposed board.',
            "the solver scores the main word and any crossing words, applies letter and word multipliers to new tiles, and adds 50 points for using all seven rack tiles. it ranks by immediate score; it doesn't evaluate the remaining rack or future turns.",
          ],
        },
        {
          id: 'checking-results',
          label: 'checking',
          title: 'checking the result',
          paragraphs: [
            'i checked positions in the interface, including selecting a suggestion and resetting the board and rack. the program validates existing board words and tile counts before solving. the screenshot uses a position based on OdKUq.png with two tiles removed so a full rack fits the tile distribution. selecting the top result placed seven highlighted tiles and cleared the rack; the two S tiles came from blanks and scored zero.',
            "the benchmark times nine solves on fixed-seed random positions with zero, two, or four moves on the board, including blank-tile racks. on one run on this computer, the average was 0.1665 seconds, the median was 0.0780 seconds, and the slowest was 0.3688 seconds. the timer excludes dictionary loading, position generation, and the interface. this is a small speed measurement, not a comparison against the paper's timings or proof that every generated move is legal; the benchmark positions themselves are built with the same solver.",
          ],
        },
      ],
    },
    title: 'scrabble solver',
    summary: 'finds and ranks legal moves from your board and rack.',
    description:
      'a scrabble solver i built for school. it finds and ranks legal moves from the board and your rack.',
    detail:
      'uses anchor squares, cross-checks and trie search to prune invalid moves. a tkinter board lets you enter a rack, try positions and inspect the results.',
    tech: ['python', 'tkinter', 'trie'],
    note: '',
    repository: 'https://github.com/aehsan275/scrabblesolver',
  },
] as const;
export type Project = (typeof projects)[number];

export const thoughts = [
  {
    id: 'why-success-feels-average',
    title: 'why success feels average',
    summary: 'you get there, and somehow the distance was the only part that felt real.',
    details: [
      "its kinda crazy how quickly everything u once wanted just becomes normal. like a few months ago i would've done anything to be where i am rn, and now that im actually here, its js another part of everyday life. things that once seemed so far away barely even feel like achievements anymore, because the moment u get somewhere, ur idea of what counts as impressive changes.",
      "and i think thats one of the weirdest things abt ambition. every time u reach a goal, the goalposts move. u meet people doing things u didn't even know were possible, realize how much more there is to learn, and suddenly the things u used to be proud of seem pretty ordinary. not necessarily because they matter any less, but because ur perspective has changed.",
      "and maybe thats just how growth works. the version of u that once dreamed of being here probably wouldn't even recognize what u consider normal now. but its interesting how we spend so much time thinking abt where we're going that we rarely realize how far we've already come.",
    ],
  },
  {
    id: 'the-more-you-know-the-less-you-do',
    title: 'the more you know, the less you do',
    summary: 'the deeper you look, the less anything stays simple.',
    details: [
      'fractals are such a weird concept. something can have a finite area but an infinite perimeter. you could keep zooming in forever and there would always be another layer of complexity, even though the entire thing is governed by a relatively simple set of rules.',
      "knowledge kinda works the same way. you start learning something and eventually reach a point where you think you have a pretty decent understanding of it. but as you go deeper, you start noticing things you wouldn't have even thought to question before. and suddenly something that once seemed relatively straightforward becomes infinitely more complicated.",
      "this also ties into the dunning-kruger effect. when your understanding of something is limited, your perception of its complexity is limited too. you don't really have a way of knowing how much you're missing because you haven't learned enough to recognize those gaps in the first place.",
      "and there's something almost absurd about how learning works because of this. you can spend years getting better at something, objectively knowing more than you ever have, while simultaneously becoming less confident in how much you actually understand.",
      'every answer introduces questions that you previously lacked the knowledge to even formulate. and those questions lead to even more questions, to the point where the depth of a subject seems to grow faster than your ability to explore it.',
      "maybe that's why complete mastery feels like such a strange concept. how would you even recognize that you've reached the end of something when every previous level of understanding made you realize there was so much more beyond it?",
      "**you can only see the complexity you're capable of understanding, which makes it almost impossible to know how much complexity you're still blind to.**",
    ],
  },
  {
    id: 'who-are-we',
    title: 'who are we?',
    summary: 'you keep changing, then call the continuity a self.',
    details: [
      'five years ago, you had your own ambitions, beliefs, and understanding of the world. things that once meant everything to you might barely matter anymore. at the time, that version of you felt just as permanent as the person you are today, completely unaware of how much would eventually change.',
      "the ship of theseus explores a similar idea. imagine a ship whose wooden planks are gradually replaced, one at a time. replacing a single plank hardly changes anything, and neither does replacing the next. eventually, every original plank is gone, yet the ship continues to exist under the same name, despite being made of entirely different pieces. there's no obvious moment where it stops being the original ship, even though the difference between its beginning and its end is absolute.",
      'our lives unfold in much the same way. beliefs evolve, memories fade, relationships come and go, and experiences gradually reshape our understanding of ourselves. each individual change seems insignificant, but over several years, they accumulate into someone who might have very little in common with the person they once were.',
      'the way we experience time makes this even more complicated. every new version of ourselves inherits the memories and experiences of the previous one, creating an uninterrupted sense of identity. we never really notice ourselves changing because the transition is so gradual. the person you are today feels like a natural continuation of the person you were yesterday, regardless of how different you might become over an entire lifetime.',
      "the concept of a soul adds another layer to this. for centuries, people have questioned whether some permanent essence exists beneath everything that changes about us. something that persists through every belief we've abandoned, every memory we've forgotten, and every version of ourselves we've outgrown. it's difficult to know whether such an essence exists, especially when so much of what makes us who we are comes from experiences that never stop reshaping us.",
      "consider how many versions of yourself have already existed. each had their own understanding of who they were, their own ambitions, and their own expectations for the future. some believed things you no longer believe, cared deeply about things you've since forgotten, and imagined lives that never came to exist. every single one of them contributed to the person you are now, even though much of what defined them has slowly disappeared.",
      "the ship of theseus could have every plank replaced without any single replacement definitively making it a different ship. we experience a similar continuity throughout our lives. there's never a clear boundary separating who we used to be from who we've become. every change feels small enough to preserve our sense of identity, even when the accumulation of those changes transforms us completely.",
      "**you could spend your entire life becoming someone your younger self wouldn't recognize, without ever experiencing a single moment where you stopped feeling like yourself.**",
      '**every version of you has believed itself to be the real you. the person you are today is no different, and one day, they too will exist only as a memory in the mind of someone who still calls themselves you.**',
    ],
  },
] as const;
