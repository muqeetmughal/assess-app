export const seedAssessments = [
  {
    id: 'support-readiness',
    title: 'Customer Support Readiness',
    description: 'Evaluate frontline support skills across communication, triage, and escalation judgement.',
    category: 'Operations',
    passingScore: 70,
    durationMinutes: 12,
    questions: [
      {
        prompt: 'A customer reports they were charged twice. What is the best first response?',
        skill: 'Communication',
        options: [
          'Tell them billing will investigate and close the chat',
          'Acknowledge the issue, apologize, and verify the transaction details',
          'Ask them to contact their bank first',
          'Send a refund immediately without verification'
        ],
        correctIndex: 1,
        explanation: 'Strong support starts with empathy and fact gathering before action.'
      },
      {
        prompt: 'An issue impacts many users and has no workaround. What should happen next?',
        skill: 'Escalation',
        options: [
          'Handle each ticket separately and avoid alarming the team',
          'Escalate to the incident path and communicate known impact clearly',
          'Wait for engineering to notice trend data',
          'Mark all related tickets as solved'
        ],
        correctIndex: 1,
        explanation: 'Broad-impact issues need incident handling and proactive communication.'
      },
      {
        prompt: 'Which note is the best internal ticket update?',
        skill: 'Documentation',
        options: [
          'Customer angry. Need help.',
          'Issue maybe payments. Unsure.',
          'Customer saw duplicate charge on invoice INV-2041, card ending 8821, first seen 14:20 UTC, screenshot attached.',
          'Refund please'
        ],
        correctIndex: 2,
        explanation: 'Good documentation is precise, structured, and actionable.'
      },
      {
        prompt: 'A user asks for an ETA on a bug fix with no confirmed timeline. Best answer?',
        skill: 'Expectation Management',
        options: [
          'Promise a fix by end of day',
          'Say there is no ETA and stop there',
          'Share that the issue is under investigation, explain current impact, and commit to updates when timing is confirmed',
          'Avoid replying until engineering responds'
        ],
        correctIndex: 2,
        explanation: 'Clear, honest expectation management builds trust without overcommitting.'
      }
    ]
  },
  {
    id: 'frontend-screen',
    title: 'Frontend Fundamentals Screen',
    description: 'A quick assessment for junior frontend candidates covering React, accessibility, and debugging.',
    category: 'Engineering',
    passingScore: 75,
    durationMinutes: 15,
    questions: [
      {
        prompt: 'In React, when rendering a list, what is the main purpose of a key prop?',
        skill: 'React',
        options: [
          'To style each item differently',
          'To help React track item identity between renders',
          'To make arrays sortable',
          'To memoize the component automatically'
        ],
        correctIndex: 1,
        explanation: 'Keys help React reconcile list updates efficiently and correctly.'
      },
      {
        prompt: 'Which choice most improves button accessibility?',
        skill: 'Accessibility',
        options: [
          'Using a div with onClick',
          'Using a button element with clear text label',
          'Hiding text and relying only on color',
          'Disabling focus outlines globally'
        ],
        correctIndex: 1,
        explanation: 'Semantic elements and visible labels are core accessibility wins.'
      },
      {
        prompt: 'A component rerenders too often because an object prop is recreated every render. A practical fix is to:',
        skill: 'Performance',
        options: [
          'Use useMemo for the object when appropriate',
          'Move all state into local variables',
          'Replace React with vanilla JS',
          'Add more CSS classes'
        ],
        correctIndex: 0,
        explanation: 'Stable references can reduce avoidable rerenders in memoized trees.'
      },
      {
        prompt: 'What is the best first step when debugging a production UI bug?',
        skill: 'Debugging',
        options: [
          'Rewrite the component from scratch',
          'Reproduce it reliably and gather evidence',
          'Guess the likely cause and patch live',
          'Ask design to change the requirement'
        ],
        correctIndex: 1,
        explanation: 'Reliable reproduction reduces guesswork and speeds debugging.'
      }
    ]
  }
];
