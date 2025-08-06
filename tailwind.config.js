/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '0',
  		screens: {
  			sm: '640px',
  			md: '768px',
  			lg: '1024px',
  			xl: '1280px',
  			'2xl': '1536px'
  		}
  	},
  	extend: {
  		colors: {
  			sage: {
  				'25': 'rgb(252, 253, 252)',
  				'50': 'rgb(248, 250, 248)',
  				'100': 'rgb(240, 244, 240)',
  				'200': 'rgb(226, 235, 227)',
  				'300': 'rgb(197, 218, 200)',
  				'400': 'rgb(154, 192, 159)',
  				'500': 'rgb(107, 161, 115)',
  				'600': 'rgb(76, 130, 86)',
  				'700': 'rgb(58, 104, 68)'
  			},
  			lavender: {
  				'50': 'rgb(250, 249, 253)',
  				'100': 'rgb(243, 240, 249)',
  				'200': 'rgb(231, 224, 243)',
  				'300': 'rgb(206, 193, 231)',
  				'400': 'rgb(171, 152, 212)',
  				'500': 'rgb(139, 115, 191)'
  			},
  			cream: {
  				'50': 'rgb(254, 252, 248)',
  				'100': 'rgb(251, 246, 237)',
  				'200': 'rgb(246, 235, 217)',
  				'300': 'rgb(237, 218, 188)'
  			},
  			'soft-blue': {
  				'50': 'rgb(248, 251, 255)',
  				'100': 'rgb(238, 246, 254)',
  				'200': 'rgb(220, 237, 252)',
  				'300': 'rgb(186, 217, 247)',
  				'400': 'rgb(124, 185, 238)',
  				'500': 'rgb(76, 158, 226)'
  			},
  			'warm-gray': {
  				'50': 'rgb(250, 250, 249)',
  				'100': 'rgb(245, 245, 244)',
  				'200': 'rgb(231, 229, 228)',
  				'300': 'rgb(214, 211, 209)',
  				'400': 'rgb(168, 162, 158)',
  				'500': 'rgb(120, 113, 108)',
  				'600': 'rgb(87, 83, 78)',
  				'700': 'rgb(68, 64, 60)',
  				'800': 'rgb(41, 37, 36)',
  				'900': 'rgb(28, 25, 23)'
  			},
  			primary: {
  				'50': '#f0f9ff',
  				'500': '#3b82f6',
  				'600': '#2563eb',
  				'700': '#1d4ed8',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			canvas: {
  				blue: '#0374B5',
  				orange: '#FC5E13'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			'scheme-background': 'var(--scheme-background, #ffffff)',
  			'scheme-foreground': 'var(--scheme-foreground, #f8fafc)',
  			'scheme-text': 'var(--scheme-text, #0f172a)',
  			'scheme-border': 'var(--scheme-border, #e2e8f0)',
  			'neutral-darkest': 'var(--neutral-darkest, #0f172a)',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontSize: {
  			'heading-h1': [
  				'3rem',
  				{
  					lineHeight: '1.2',
  					fontWeight: '700'
  				}
  			],
  			'heading-h2': [
  				'2.25rem',
  				{
  					lineHeight: '1.2',
  					fontWeight: '700'
  				}
  			],
  			'heading-h3': [
  				'1.875rem',
  				{
  					lineHeight: '1.3',
  					fontWeight: '700'
  				}
  			],
  			'heading-h4': [
  				'1.5rem',
  				{
  					lineHeight: '1.3',
  					fontWeight: '600'
  				}
  			],
  			'heading-h5': [
  				'1.25rem',
  				{
  					lineHeight: '1.4',
  					fontWeight: '600'
  				}
  			],
  			'text-medium': [
  				'1rem',
  				{
  					lineHeight: '1.6',
  					fontWeight: '400'
  				}
  			],
  			'text-regular': [
  				'0.875rem',
  				{
  					lineHeight: '1.5',
  					fontWeight: '400'
  				}
  			],
  			'text-small': [
  				'0.75rem',
  				{
  					lineHeight: '1.4',
  					fontWeight: '400'
  				}
  			]
  		},
  		borderRadius: {
  			button: '0.5rem',
  			card: '0.75rem',
  			image: '0.75rem',
  			carousel: '50%',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			heading: [
  				'Sora',
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		backgroundImage: {
  			'gradient-calm': 'linear-gradient(135deg, rgb(254, 252, 248) 0%, rgb(250, 249, 253) 50%, rgb(248, 251, 255) 100%)',
  			'gradient-sage': 'linear-gradient(135deg, rgb(248, 250, 248) 0%, rgb(254, 252, 248) 100%)',
  			'gradient-soft': 'linear-gradient(135deg, rgb(248, 251, 255) 0%, rgb(250, 249, 253) 100%)'
  		},
  		boxShadow: {
  			soft: '0 2px 8px rgba(87, 83, 78, 0.08), 0 1px 4px rgba(87, 83, 78, 0.04)',
  			'soft-hover': '0 4px 16px rgba(87, 83, 78, 0.12), 0 2px 8px rgba(87, 83, 78, 0.08)',
  			gentle: '0 1px 3px rgba(87, 83, 78, 0.06), 0 1px 2px rgba(87, 83, 78, 0.04)'
  		},
  		animation: {
  			'gentle-bounce': 'gentle-bounce 2s infinite',
  			'soft-pulse': 'soft-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  		},
  		keyframes: {
  			'gentle-bounce': {
  				'0%, 100%': {
  					transform: 'translateY(0)',
  					animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
  				},
  				'50%': {
  					transform: 'translateY(-2px)',
  					animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
  				}
  			},
  			'soft-pulse': {
  				'0%, 100%': {
  					opacity: '1'
  				},
  				'50%': {
  					opacity: '.7'
  				}
  			}
  		}
  	}
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.line-clamp-1': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '1',
        },
        '.line-clamp-2': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '2',
        },
        '.line-clamp-3': {
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-box-orient': 'vertical',
          '-webkit-line-clamp': '3',
        },
      }
      addUtilities(newUtilities)
    },
      require("tailwindcss-animate")
],
}
