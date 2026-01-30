import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			background: {
  				DEFAULT: 'hsl(var(--background))',
  				secondary: '#1c1c1e',
  				tertiary: '#2c2c2e',
  			},
  			glass: {
  				DEFAULT: 'rgba(255, 255, 255, 0.05)',
  				hover: 'rgba(255, 255, 255, 0.08)'
  			},
  			foreground: 'hsl(var(--foreground))',
  			blue: {
  				'50': 'rgba(0, 122, 255, 0.1)',
  				DEFAULT: '#007aff'
  			},
  			green: {
  				'50': 'rgba(48, 209, 88, 0.1)',
  				DEFAULT: '#30d158'
  			},
  			red: {
  				'50': 'rgba(255, 59, 48, 0.1)',
  				DEFAULT: '#ff3b30'
  			},
  			orange: {
  				'50': 'rgba(255, 149, 0, 0.1)',
  				DEFAULT: '#ff9500'
  			},
  			yellow: {
  				'50': 'rgba(255, 214, 10, 0.1)',
  				DEFAULT: '#ffd60a'
  			},
  			purple: {
  				'50': 'rgba(191, 90, 242, 0.1)',
  				DEFAULT: '#bf5af2'
  			},
  			cyan: {
  				'50': 'rgba(100, 210, 255, 0.1)',
  				DEFAULT: '#64d2ff'
  			},
  			heli: {
  				'50': 'rgba(255, 107, 157, 0.15)',
  				DEFAULT: '#ff6b9d'
  			},
  			shahar: {
  				'50': 'rgba(90, 200, 250, 0.15)',
  				DEFAULT: '#5ac8fa'
  			},
  			business: {
  				'50': 'rgba(100, 210, 255, 0.15)',
  				DEFAULT: '#64d2ff'
  			},
  			cogs: {
  				'50': 'rgba(255, 107, 107, 0.15)',
  				DEFAULT: '#ff6b6b'
  			},
  			opex: {
  				'50': 'rgba(78, 205, 196, 0.15)',
  				DEFAULT: '#4ecdc4'
  			},
  			financial: {
  				'50': 'rgba(168, 85, 247, 0.15)',
  				DEFAULT: '#a855f7'
  			},
  			mixed: {
  				'50': 'rgba(255, 149, 0, 0.15)',
  				DEFAULT: '#ff9500'
  			},
  			border: {
  				DEFAULT: 'hsl(var(--border))',
  				secondary: 'rgba(255, 255, 255, 0.05)',
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'SF Pro Display',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Inter',
  				'sans-serif'
  			],
  			mono: [
  				'SF Mono',
  				'JetBrains Mono',
  				'monospace'
  			]
  		},
  		fontSize: {
  			hero: [
  				'3.5rem',
  				{
  					lineHeight: '1.1',
  					fontWeight: '700'
  				}
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backdropBlur: {
  			glass: '20px'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.2s ease-out',
  			'slide-up': 'slideUp 0.3s ease-out'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			}
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
