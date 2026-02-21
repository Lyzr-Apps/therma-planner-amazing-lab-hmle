'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { callAIAgent, type AIAgentResponse } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  FiCalendar, FiPlus, FiTrash2, FiRefreshCw, FiCopy,
  FiChevronDown, FiChevronUp, FiAlertTriangle, FiAlertCircle,
  FiFileText, FiTrendingUp, FiCrosshair, FiPieChart,
  FiBarChart2, FiPercent, FiCheck, FiLoader, FiClock,
  FiImage, FiFilm, FiLayers,
  FiZap, FiActivity, FiTarget, FiSend,
  FiDollarSign, FiEye, FiHash
} from 'react-icons/fi'

// ─── Constants ──────────────────────────────────────────────────────
const AGENT_ID = '699a199d4274f089c16d42b3'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const YEARS = [2025, 2026, 2027]
const GOALS = ['Bookings', 'Messages', 'Website Visits', 'Leads', 'Engagement Growth']
const FREQUENCIES = [3, 5, 7]

// ─── TypeScript Interfaces ──────────────────────────────────────────
interface Promotion {
  name: string
  date: string
  validityStart: string
  validityEnd: string
  notes: string
}

interface Post {
  day: string
  date: string
  pillar: string
  objectiveTag: string
  format: string
  suggestedTime: string
  caption: string
  ctaType: string
  visualConcept: string
  hashtags: string[]
  suggestedAdUse: string
  remarketingTag: string
  culturalWarning: string | null
}

interface Week {
  weekNumber: number
  dateRange: string
  posts: Post[]
}

interface Summary {
  month: string
  year: number
  totalPosts: number
  promotionalPosts: number
  conversionPosts: number
  awarenessConversionRatio: string
  formatDistribution: {
    Image: number
    Carousel: number
    Reel: number
    Story: number
  }
  offerSupportPercentage: number
}

interface CalendarData {
  summary: Summary
  weeks: Week[]
}

// ─── Sample Data ────────────────────────────────────────────────────
const SAMPLE_DATA: CalendarData = {
  summary: {
    month: 'March',
    year: 2026,
    totalPosts: 20,
    promotionalPosts: 8,
    conversionPosts: 6,
    awarenessConversionRatio: '60:40',
    formatDistribution: { Image: 6, Carousel: 5, Reel: 6, Story: 3 },
    offerSupportPercentage: 40
  },
  weeks: [
    {
      weekNumber: 1,
      dateRange: 'March 1 - March 7',
      posts: [
        {
          day: 'Monday',
          date: 'March 1',
          pillar: 'Wellness & Spa Experience',
          objectiveTag: 'Awareness',
          format: 'Carousel',
          suggestedTime: '10:00 AM',
          caption: 'Start your week the right way -- immersed in the healing warmth of Therma Village mineral pools. Our thermal waters are naturally heated to 38 degrees C, rich in minerals that soothe muscles and rejuvenate your skin.\n\nSwipe to explore our top 5 spa rituals that locals swear by.',
          ctaType: 'DM Inquiry',
          visualConcept: 'Carousel of 5 slides showing each spa ritual with soft warm lighting, steam effects, and close-up shots of mineral water pools.',
          hashtags: ['#ThermaVillage', '#SpaDay', '#WellnessRetreat', '#MineralPools', '#Relaxation'],
          suggestedAdUse: 'Boost',
          remarketingTag: 'spa_interest',
          culturalWarning: null
        },
        {
          day: 'Wednesday',
          date: 'March 3',
          pillar: 'Sport & Activity',
          objectiveTag: 'Engagement',
          format: 'Reel',
          suggestedTime: '6:00 PM',
          caption: 'Who says wellness has to be slow? Our adventure trails and outdoor fitness zones will get your heart pumping while surrounded by breathtaking mountain views.\n\nTag a friend who needs this kind of workout motivation!',
          ctaType: 'Comment Trigger',
          visualConcept: 'Dynamic reel showing quick cuts of hiking trails, outdoor yoga, mountain biking, and fitness zone activities with upbeat music.',
          hashtags: ['#ActiveWellness', '#MountainFitness', '#OutdoorAdventure', '#ThermaVillage', '#FitnessGoals'],
          suggestedAdUse: 'Organic',
          remarketingTag: 'activity_engaged',
          culturalWarning: null
        },
        {
          day: 'Friday',
          date: 'March 5',
          pillar: 'Special Offers & Promotions',
          objectiveTag: 'Conversion',
          format: 'Image',
          suggestedTime: '12:00 PM',
          caption: 'SPRING ESCAPE DEAL: Book your 3-night wellness package before March 15 and receive a complimentary couples massage + thermal pool access.\n\nLimited availability -- only 12 packages remaining.\n\nBook now at the link in bio or DM us for details.',
          ctaType: 'Direct Booking',
          visualConcept: 'Elegant promotional image with spring flowers framing the spa entrance, overlay text showing the offer details with a warm golden color palette.',
          hashtags: ['#SpringDeal', '#WellnessPackage', '#BookNow', '#ThermaVillage', '#LimitedOffer'],
          suggestedAdUse: 'Full Paid',
          remarketingTag: 'promo_spring_escape',
          culturalWarning: null
        },
        {
          day: 'Sunday',
          date: 'March 7',
          pillar: 'Culinary & Dining',
          objectiveTag: 'Awareness',
          format: 'Reel',
          suggestedTime: '11:00 AM',
          caption: 'Sunday brunch, elevated. Our chef transforms locally sourced ingredients into dishes that nourish body and soul.\n\nFrom farm-fresh salads to traditional Bulgarian recipes with a modern twist -- every meal is part of the wellness journey.',
          ctaType: 'Save/Share',
          visualConcept: 'Cinematic reel of chef preparing dishes, close-ups of plating, guests enjoying brunch on the terrace with mountain backdrop.',
          hashtags: ['#FarmToTable', '#WellnessDining', '#SundayBrunch', '#ThermaVillage', '#HealthyEating'],
          suggestedAdUse: 'Organic',
          remarketingTag: 'culinary_interest',
          culturalWarning: null
        }
      ]
    },
    {
      weekNumber: 2,
      dateRange: 'March 8 - March 14',
      posts: [
        {
          day: 'Monday',
          date: 'March 8',
          pillar: 'Guest Stories & Social Proof',
          objectiveTag: 'Retention',
          format: 'Carousel',
          suggestedTime: '9:00 AM',
          caption: '"We came for the spa, we stayed for the magic." -- Elena & Dimitar, returning guests since 2023.\n\nSwipe to read 4 stories from guests who turned their first visit into an annual tradition.',
          ctaType: 'DM Inquiry',
          visualConcept: 'Carousel featuring guest photos with quote overlays, warm filter, each slide showing a different couple/family with their testimonial.',
          hashtags: ['#GuestStories', '#ThermaVillage', '#SpaReview', '#WellnessJourney', '#HappyGuests'],
          suggestedAdUse: 'Boost',
          remarketingTag: 'social_proof_viewer',
          culturalWarning: null
        },
        {
          day: 'Wednesday',
          date: 'March 10',
          pillar: 'Nature & Surroundings',
          objectiveTag: 'Awareness',
          format: 'Image',
          suggestedTime: '7:00 AM',
          caption: 'Morning mist rising over the Rhodope Mountains. This is the view that greets you every sunrise at Therma Village.\n\nNature does the healing. We just provide the perfect setting.',
          ctaType: 'Website Visit',
          visualConcept: 'Stunning landscape photo of misty mountains at sunrise, shot from the resort terrace, soft golden light filtering through fog.',
          hashtags: ['#MorningViews', '#RhodopeMountains', '#NatureHeals', '#ThermaVillage', '#Bulgaria'],
          suggestedAdUse: 'Organic',
          remarketingTag: 'nature_explorer',
          culturalWarning: null
        },
        {
          day: 'Friday',
          date: 'March 12',
          pillar: 'Wellness & Spa Experience',
          objectiveTag: 'Conversion',
          format: 'Story',
          suggestedTime: '5:00 PM',
          caption: 'FLASH FRIDAY: 20% off all spa treatments booked this weekend. Tap the link to secure your spot. Offer expires Sunday midnight.',
          ctaType: 'Direct Booking',
          visualConcept: 'Vertical story format with countdown timer sticker, spa treatment montage background, bold text overlay with offer details.',
          hashtags: ['#FlashFriday', '#SpaDeal', '#WeekendWellness', '#ThermaVillage'],
          suggestedAdUse: 'Full Paid',
          remarketingTag: 'flash_sale_clicker',
          culturalWarning: null
        }
      ]
    }
  ]
}

// ─── Pillar Color Map ───────────────────────────────────────────────
function getPillarColor(pillar: string): string {
  const normalized = (pillar ?? '').toLowerCase()
  if (normalized.includes('wellness') || normalized.includes('spa')) return 'bg-teal-100 text-teal-800 border-teal-200'
  if (normalized.includes('sport') || normalized.includes('activity')) return 'bg-blue-100 text-blue-800 border-blue-200'
  if (normalized.includes('culinary') || normalized.includes('dining')) return 'bg-amber-100 text-amber-800 border-amber-200'
  if (normalized.includes('nature') || normalized.includes('surrounding')) return 'bg-green-100 text-green-800 border-green-200'
  if (normalized.includes('guest') || normalized.includes('social proof')) return 'bg-purple-100 text-purple-800 border-purple-200'
  if (normalized.includes('offer') || normalized.includes('promotion')) return 'bg-rose-100 text-rose-800 border-rose-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

function getObjectiveColor(tag: string): string {
  const normalized = (tag ?? '').toLowerCase()
  if (normalized.includes('awareness')) return 'bg-sky-100 text-sky-800 border-sky-200'
  if (normalized.includes('engagement')) return 'bg-violet-100 text-violet-800 border-violet-200'
  if (normalized.includes('conversion')) return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (normalized.includes('retention')) return 'bg-amber-100 text-amber-800 border-amber-200'
  if (normalized.includes('community')) return 'bg-pink-100 text-pink-800 border-pink-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

function getCtaColor(cta: string): string {
  const normalized = (cta ?? '').toLowerCase()
  if (normalized.includes('direct booking')) return 'bg-emerald-500 text-white'
  if (normalized.includes('dm') || normalized.includes('inquiry')) return 'bg-blue-500 text-white'
  if (normalized.includes('website')) return 'bg-violet-500 text-white'
  if (normalized.includes('comment')) return 'bg-amber-500 text-white'
  if (normalized.includes('save') || normalized.includes('share')) return 'bg-pink-500 text-white'
  return 'bg-gray-500 text-white'
}

function getFormatIcon(format: string) {
  const normalized = (format ?? '').toLowerCase()
  if (normalized.includes('image')) return FiImage
  if (normalized.includes('carousel')) return FiLayers
  if (normalized.includes('reel')) return FiFilm
  if (normalized.includes('story')) return FiClock
  return FiFileText
}

function getAdIcon(adUse: string) {
  const normalized = (adUse ?? '').toLowerCase()
  if (normalized.includes('full paid')) return FiDollarSign
  if (normalized.includes('boost')) return FiZap
  return FiEye
}

// ─── JSON Response Parser ───────────────────────────────────────────
function parseAgentResponse(result: AIAgentResponse): CalendarData | null {
  if (!result.success) return null

  let data: any = result.response?.result

  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      return null
    }
  }

  if (data?.result && typeof data.result === 'object') {
    data = data.result
  }

  if (!data?.summary && !data?.weeks) {
    if (data?.response?.result) {
      data = data.response.result
      if (typeof data === 'string') {
        try { data = JSON.parse(data) } catch { return null }
      }
    }
  }

  if (!data?.summary || !Array.isArray(data?.weeks)) return null

  return data as CalendarData
}

// ─── Markdown Renderer ──────────────────────────────────────────────
function formatInline(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">{part}</strong>
    ) : (
      part
    )
  )
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-1.5">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-2 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-2 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-3 mb-1">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{formatInline(line.slice(2))}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{formatInline(line.replace(/^\d+\.\s/, ''))}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm leading-relaxed">{formatInline(line)}</p>
      })}
    </div>
  )
}

// ─── Post to Text (for clipboard) ───────────────────────────────────
function postToText(post: Post): string {
  const lines: string[] = []
  lines.push(`${post.day ?? ''} - ${post.date ?? ''}`)
  lines.push(`Pillar: ${post.pillar ?? ''}`)
  lines.push(`Objective: ${post.objectiveTag ?? ''}`)
  lines.push(`Format: ${post.format ?? ''} | Time: ${post.suggestedTime ?? ''}`)
  lines.push('')
  lines.push(`Caption:`)
  lines.push(post.caption ?? '')
  lines.push('')
  lines.push(`CTA: ${post.ctaType ?? ''}`)
  lines.push(`Visual Concept: ${post.visualConcept ?? ''}`)
  if (Array.isArray(post.hashtags) && post.hashtags.length > 0) {
    lines.push(`Hashtags: ${post.hashtags.join(' ')}`)
  }
  lines.push(`Ad Use: ${post.suggestedAdUse ?? ''}`)
  lines.push(`Remarketing Tag: ${post.remarketingTag ?? ''}`)
  if (post.culturalWarning) {
    lines.push(`Cultural Warning: ${post.culturalWarning}`)
  }
  return lines.join('\n')
}

function weekToText(week: Week): string {
  const header = `Week ${week.weekNumber ?? ''} (${week.dateRange ?? ''})`
  const separator = '='.repeat(header.length)
  const posts = Array.isArray(week.posts) ? week.posts.map(postToText).join('\n\n---\n\n') : ''
  return `${separator}\n${header}\n${separator}\n\n${posts}`
}

// ─── ErrorBoundary ──────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">Try again</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── PostCard Component ─────────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(postToText(post))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const FormatIcon = getFormatIcon(post.format)
  const AdIcon = getAdIcon(post.suggestedAdUse)

  return (
    <div className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-start justify-between">
        <div>
          <p className="font-semibold text-sm tracking-tight text-foreground">{post.day ?? ''}</p>
          <p className="text-xs text-muted-foreground">{post.date ?? ''}</p>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCopy}>
          {copied ? <FiCheck className="h-3.5 w-3.5 text-emerald-600" /> : <FiCopy className="h-3.5 w-3.5 text-muted-foreground" />}
        </Button>
      </div>

      {/* Badges */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border', getPillarColor(post.pillar))}>{post.pillar ?? 'Unknown'}</span>
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border', getObjectiveColor(post.objectiveTag))}>{post.objectiveTag ?? ''}</span>
      </div>

      {/* Format & Time */}
      <div className="px-4 pb-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 bg-secondary/60 px-2 py-0.5 rounded-full">
          <FormatIcon className="h-3 w-3" />
          {post.format ?? ''}
        </span>
        <span className="inline-flex items-center gap-1">
          <FiClock className="h-3 w-3" />
          {post.suggestedTime ?? ''}
        </span>
      </div>

      {/* Caption */}
      <div className="px-4 pb-3">
        <div className="text-sm leading-relaxed text-foreground/90">
          {renderMarkdown(post.caption ?? '')}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pb-3">
        <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium', getCtaColor(post.ctaType))}>
          {post.ctaType ?? ''}
        </span>
      </div>

      {/* Cultural Warning */}
      {post.culturalWarning && (
        <div className="px-4 pb-3">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
            <FiAlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">{post.culturalWarning}</p>
          </div>
        </div>
      )}

      {/* Collapsible Details */}
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full px-4 py-2.5 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border-t border-border/50 transition-colors bg-secondary/20">
            {expanded ? <FiChevronUp className="h-3.5 w-3.5" /> : <FiChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Hide Details' : 'Show Details'}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-2 space-y-3 bg-secondary/10">
            {/* Visual Concept */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Visual Concept</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{post.visualConcept ?? ''}</p>
            </div>

            {/* Hashtags */}
            {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Hashtags</p>
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">
                      <FiHash className="h-2.5 w-2.5" />{(tag ?? '').replace('#', '')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ad Use */}
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Ad Use:</p>
              <span className="inline-flex items-center gap-1 text-xs text-foreground/80">
                <AdIcon className="h-3 w-3" />
                {post.suggestedAdUse ?? ''}
              </span>
            </div>

            {/* Remarketing Tag */}
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Remarketing:</p>
              <span className="text-xs font-mono text-foreground/70 bg-secondary/60 px-1.5 py-0.5 rounded">{post.remarketingTag ?? ''}</span>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

// ─── WeekBlock Component ────────────────────────────────────────────
function WeekBlock({
  week,
  onRegenerate,
  regeneratingWeek,
  selectedMonth,
  selectedYear,
  targetMarket,
  primaryGoal,
  heroOffer,
  postingFrequency,
  promotions
}: {
  week: Week
  onRegenerate: (weekNum: number, dateRange: string) => void
  regeneratingWeek: number | null
  selectedMonth: string
  selectedYear: number
  targetMarket: string
  primaryGoal: string
  heroOffer: string
  postingFrequency: number
  promotions: Promotion[]
}) {
  const [weekCopied, setWeekCopied] = useState(false)
  const isRegenerating = regeneratingWeek === week.weekNumber

  const handleCopyWeek = async () => {
    await copyToClipboard(weekToText(week))
    setWeekCopied(true)
    setTimeout(() => setWeekCopied(false), 2000)
  }

  const posts = Array.isArray(week.posts) ? week.posts : []

  return (
    <div className="mb-8">
      {/* Week Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Week {week.weekNumber ?? '?'}
          </h3>
          <p className="text-sm text-muted-foreground">{week.dateRange ?? ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyWeek} className="h-8 bg-white/50 backdrop-blur-sm border-white/30">
            {weekCopied ? <><FiCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />Copied</> : <><FiCopy className="h-3.5 w-3.5 mr-1.5" />Copy Week</>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onRegenerate(week.weekNumber, week.dateRange ?? '')} disabled={isRegenerating} className="h-8 bg-white/50 backdrop-blur-sm border-white/30">
            {isRegenerating ? <><FiLoader className="h-3.5 w-3.5 mr-1.5 animate-spin" />Regenerating...</> : <><FiRefreshCw className="h-3.5 w-3.5 mr-1.5" />Regenerate</>}
          </Button>
        </div>
      </div>

      {/* Posts Grid */}
      {isRegenerating ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] rounded-xl p-4 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2"><Skeleton className="h-5 w-32 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {posts.map((post, idx) => (
            <PostCard key={`${week.weekNumber}-${idx}`} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Summary Dashboard ──────────────────────────────────────────────
function SummaryDashboard({ summary }: { summary: Summary }) {
  const formatDist = summary?.formatDistribution ?? {}

  const stats = [
    { label: 'Total Posts', value: summary?.totalPosts ?? 0, icon: FiFileText, color: 'text-emerald-600' },
    { label: 'Promotional Posts', value: summary?.promotionalPosts ?? 0, icon: FiTrendingUp, color: 'text-blue-600' },
    { label: 'Conversion Posts', value: summary?.conversionPosts ?? 0, icon: FiCrosshair, color: 'text-violet-600' },
    { label: 'Awareness:Conversion', value: summary?.awarenessConversionRatio ?? 'N/A', icon: FiPieChart, color: 'text-amber-600' },
    {
      label: 'Format Distribution',
      value: '',
      detail: `Img ${formatDist.Image ?? 0} / Car ${formatDist.Carousel ?? 0} / Reel ${formatDist.Reel ?? 0} / Story ${formatDist.Story ?? 0}`,
      icon: FiBarChart2,
      color: 'text-pink-600'
    },
    { label: 'Offer Support', value: `${summary?.offerSupportPercentage ?? 0}%`, icon: FiPercent, color: 'text-teal-600' }
  ]

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold tracking-tight text-foreground mb-4">
        {summary?.month ?? ''} {summary?.year ?? ''} -- Monthly Summary
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {stats.map((stat, idx) => {
          const IconComp = stat.icon
          return (
            <div key={idx} className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] rounded-xl p-4 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <IconComp className={cn('h-4 w-4', stat.color)} />
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </div>
              {stat.detail ? (
                <p className="text-sm font-semibold tracking-tight text-foreground">{stat.detail}</p>
              ) : (
                <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Agent Status ───────────────────────────────────────────────────
function AgentStatus({ isActive }: { isActive: boolean }) {
  return (
    <div className="bg-white/60 backdrop-blur-[12px] border border-white/[0.18] rounded-xl p-3">
      <div className="flex items-center gap-2">
        <div className={cn('h-2 w-2 rounded-full', isActive ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30')} />
        <span className="text-xs font-medium text-foreground">Content Calendar Strategist Agent</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 ml-4">ID: {AGENT_ID}</p>
    </div>
  )
}

// ─── LocalStorage Helpers ────────────────────────────────────────────
const STORAGE_KEY = 'therma_calendar_form_state'

interface FormState {
  selectedMonth: string
  selectedYear: number
  targetMarket: string
  primaryGoal: string
  heroOffer: string
  postingFrequency: number
  promotions: Promotion[]
}

function loadFormState(): Partial<FormState> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveFormState(state: FormState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or unavailable -- silently ignore
  }
}

// ─── Main Page Component ────────────────────────────────────────────
export default function Page() {
  // Load persisted state once on mount
  const initialState = useRef<Partial<FormState>>(loadFormState())

  // Form state -- initialized from localStorage if available
  const [selectedMonth, setSelectedMonth] = useState(initialState.current.selectedMonth ?? 'March')
  const [selectedYear, setSelectedYear] = useState(initialState.current.selectedYear ?? 2026)
  const [targetMarket, setTargetMarket] = useState(initialState.current.targetMarket ?? 'Both')
  const [primaryGoal, setPrimaryGoal] = useState(initialState.current.primaryGoal ?? 'Bookings')
  const [heroOffer, setHeroOffer] = useState(initialState.current.heroOffer ?? '')
  const [postingFrequency, setPostingFrequency] = useState(initialState.current.postingFrequency ?? 5)
  const [promotions, setPromotions] = useState<Promotion[]>(
    Array.isArray(initialState.current.promotions) ? initialState.current.promotions : []
  )

  // App state
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [regeneratingWeek, setRegeneratingWeek] = useState<number | null>(null)
  const [showSampleData, setShowSampleData] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  // Persist form state to localStorage on every change
  useEffect(() => {
    saveFormState({
      selectedMonth,
      selectedYear,
      targetMarket,
      primaryGoal,
      heroOffer,
      postingFrequency,
      promotions,
    })
  }, [selectedMonth, selectedYear, targetMarket, primaryGoal, heroOffer, postingFrequency, promotions])

  // Promotion management
  const addPromotion = () => {
    setPromotions(prev => [...prev, { name: '', date: '', validityStart: '', validityEnd: '', notes: '' }])
  }

  const removePromotion = (index: number) => {
    setPromotions(prev => prev.filter((_, i) => i !== index))
  }

  const updatePromotion = (index: number, field: keyof Promotion, value: string) => {
    setPromotions(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  // Generate calendar
  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError(null)
    setCalendarData(null)
    setActiveAgentId(AGENT_ID)

    const promoText = promotions.length > 0
      ? `\nSpecial Promotions:\n${promotions.map((p, i) => `${i + 1}. ${p.name}${p.date ? ` - Date: ${p.date}` : ''}${p.validityStart ? ` - Valid: ${p.validityStart} to ${p.validityEnd}` : ''}${p.notes ? ` - Notes: ${p.notes}` : ''}`).join('\n')}`
      : '\nNo special promotions.'

    const message = `Generate a complete monthly Facebook content calendar for Therma Village Spa & Sport with the following configuration:

Month: ${selectedMonth} ${selectedYear}
Target Market: ${targetMarket}
Primary Goal: ${primaryGoal}
Hero Offer (Revenue Priority): ${heroOffer || 'General wellness packages'}
Posting Frequency: ${postingFrequency} posts per week
${promoText}

Please generate the complete calendar with summary dashboard and all weekly post cards following all business rules. Return in JSON format with "summary" and "weeks" fields.`

    try {
      const result = await callAIAgent(message, AGENT_ID)
      const parsed = parseAgentResponse(result)

      if (parsed) {
        setCalendarData(parsed)
      } else {
        setError('Failed to parse calendar data from the agent response. The agent may have returned an unexpected format. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred while generating the calendar.')
    } finally {
      setLoading(false)
      setActiveAgentId(null)
    }
  }, [selectedMonth, selectedYear, targetMarket, primaryGoal, heroOffer, postingFrequency, promotions])

  // Regenerate a specific week
  const handleRegenerateWeek = useCallback(async (weekNumber: number, dateRange: string) => {
    setRegeneratingWeek(weekNumber)
    setActiveAgentId(AGENT_ID)

    const promoText = promotions.length > 0
      ? `Special Promotions: ${promotions.map(p => p.name).join(', ')}`
      : ''

    const weekMessage = `Regenerate ONLY Week ${weekNumber} (${dateRange}) of the ${selectedMonth} ${selectedYear} content calendar for Therma Village Spa & Sport.

Keep the same configuration:
Month: ${selectedMonth} ${selectedYear}
Target Market: ${targetMarket}
Primary Goal: ${primaryGoal}
Hero Offer: ${heroOffer || 'General wellness packages'}
Posting Frequency: ${postingFrequency} posts per week
${promoText}

Return ONLY the regenerated week in the same JSON format with weekNumber, dateRange, and posts array. Keep it consistent with the rest of the calendar.`

    try {
      const result = await callAIAgent(weekMessage, AGENT_ID)
      const parsed = parseAgentResponse(result)

      if (parsed && Array.isArray(parsed.weeks)) {
        const newWeek = parsed.weeks.find(w => w.weekNumber === weekNumber) ?? parsed.weeks[0]
        if (newWeek) {
          setCalendarData(prev => {
            if (!prev) return prev
            const updatedWeeks = Array.isArray(prev.weeks)
              ? prev.weeks.map(w => w.weekNumber === weekNumber ? { ...newWeek, weekNumber } : w)
              : []
            return { ...prev, weeks: updatedWeeks }
          })
        }
      } else {
        // Try parsing as single week
        let data: any = result.response?.result
        if (typeof data === 'string') {
          try { data = JSON.parse(data) } catch { /* ignore */ }
        }
        if (data?.result) data = data.result
        if (data?.weekNumber && Array.isArray(data?.posts)) {
          setCalendarData(prev => {
            if (!prev) return prev
            const updatedWeeks = Array.isArray(prev.weeks)
              ? prev.weeks.map(w => w.weekNumber === weekNumber ? data : w)
              : []
            return { ...prev, weeks: updatedWeeks }
          })
        }
      }
    } catch (err) {
      // Keep existing data, just log error
      console.error('Week regeneration failed:', err)
    } finally {
      setRegeneratingWeek(null)
      setActiveAgentId(null)
    }
  }, [selectedMonth, selectedYear, targetMarket, primaryGoal, heroOffer, postingFrequency, promotions])

  // Regenerate full month
  const handleRegenerateFull = () => {
    handleGenerate()
  }

  // Display data
  const displayData = showSampleData ? SAMPLE_DATA : calendarData
  const displayWeeks = Array.isArray(displayData?.weeks) ? displayData.weeks : []

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground" style={{ backgroundImage: 'linear-gradient(135deg, hsl(160, 40%, 94%) 0%, hsl(180, 35%, 93%) 30%, hsl(160, 35%, 95%) 60%, hsl(140, 40%, 94%) 100%)' }}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-[16px] border-b border-white/[0.18] shadow-sm">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
                <FiCalendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">Therma Village Content Calendar</h1>
                <p className="text-xs text-muted-foreground">Revenue-Driven Social Content Planning System</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="sample-toggle" className="text-xs text-muted-foreground cursor-pointer">Sample Data</Label>
              <Switch id="sample-toggle" checked={showSampleData} onCheckedChange={setShowSampleData} />
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex min-h-[calc(100vh-57px)]">
          {/* Left Panel - Configuration */}
          <aside className="w-[340px] flex-shrink-0 border-r border-border/30 bg-white/40 backdrop-blur-[12px] overflow-y-auto">
            <div className="p-5 space-y-5">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-foreground mb-4">Calendar Configuration</h2>
              </div>

              {/* Month & Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Month</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="h-9 bg-white/70 border-white/30 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Year</Label>
                  <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                    <SelectTrigger className="h-9 bg-white/70 border-white/30 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* Target Market */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Target Market</Label>
                <RadioGroup value={targetMarket} onValueChange={setTargetMarket} className="flex gap-4">
                  {['Bulgaria', 'Romania', 'Both'].map(market => (
                    <div key={market} className="flex items-center space-x-1.5">
                      <RadioGroupItem value={market} id={`market-${market}`} />
                      <Label htmlFor={`market-${market}`} className="text-sm cursor-pointer">{market}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator className="bg-border/40" />

              {/* Primary Goal */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Primary Goal</Label>
                <Select value={primaryGoal} onValueChange={setPrimaryGoal}>
                  <SelectTrigger className="h-9 bg-white/70 border-white/30 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Hero Offer */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hero Offer</Label>
                <Input
                  placeholder="e.g., Summer Spa Package - 30% Off"
                  value={heroOffer}
                  onChange={(e) => setHeroOffer(e.target.value)}
                  className="h-9 bg-white/70 border-white/30 text-sm"
                />
              </div>

              <Separator className="bg-border/40" />

              {/* Posting Frequency */}
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Posting Frequency (per week)</Label>
                <div className="flex gap-2">
                  {FREQUENCIES.map(freq => (
                    <button
                      key={freq}
                      onClick={() => setPostingFrequency(freq)}
                      className={cn(
                        'flex-1 h-9 rounded-xl text-sm font-medium transition-all duration-200 border',
                        postingFrequency === freq
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                          : 'bg-white/70 text-foreground border-white/30 hover:bg-white/90'
                      )}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* Promotions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-medium text-muted-foreground">Special Promotions</Label>
                  <Button variant="ghost" size="sm" onClick={addPromotion} className="h-7 text-xs text-primary hover:text-primary">
                    <FiPlus className="h-3.5 w-3.5 mr-1" />Add
                  </Button>
                </div>

                {promotions.length === 0 && (
                  <p className="text-xs text-muted-foreground/60 italic">No promotions added yet</p>
                )}

                <div className="space-y-3">
                  {promotions.map((promo, idx) => (
                    <div key={idx} className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Promotion {idx + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => removePromotion(idx)} className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                          <FiTrash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Promotion name"
                        value={promo.name}
                        onChange={(e) => updatePromotion(idx, 'name', e.target.value)}
                        className="h-8 text-xs bg-white/50 border-white/20"
                      />
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Exact Date</Label>
                          <Input type="date" value={promo.date} onChange={(e) => updatePromotion(idx, 'date', e.target.value)} className="h-8 text-xs bg-white/50 border-white/20" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Valid From</Label>
                            <Input type="date" value={promo.validityStart} onChange={(e) => updatePromotion(idx, 'validityStart', e.target.value)} className="h-8 text-xs bg-white/50 border-white/20" />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Valid Until</Label>
                            <Input type="date" value={promo.validityEnd} onChange={(e) => updatePromotion(idx, 'validityEnd', e.target.value)} className="h-8 text-xs bg-white/50 border-white/20" />
                          </div>
                        </div>
                      </div>
                      <Textarea
                        placeholder="Custom notes (optional)"
                        value={promo.notes}
                        onChange={(e) => updatePromotion(idx, 'notes', e.target.value)}
                        className="text-xs bg-white/50 border-white/20 min-h-[40px] resize-none"
                        rows={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-xl shadow-md shadow-primary/20 transition-all duration-200"
              >
                {loading ? (
                  <><FiLoader className="h-4 w-4 mr-2 animate-spin" />Generating Calendar...</>
                ) : (
                  <><FiCalendar className="h-4 w-4 mr-2" />Generate Revenue Calendar</>
                )}
              </Button>

              {/* Agent Status */}
              <AgentStatus isActive={activeAgentId !== null} />
            </div>
          </aside>

          {/* Right Panel - Calendar Output */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 max-w-[1200px] mx-auto">
              {/* Error State */}
              {error && !loading && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-sm text-red-800 mb-1">Generation Failed</h3>
                      <p className="text-xs text-red-700">{error}</p>
                      <Button variant="outline" size="sm" onClick={handleGenerate} className="mt-3 h-8 text-xs border-red-200 text-red-700 hover:bg-red-100">
                        <FiRefreshCw className="h-3.5 w-3.5 mr-1.5" />Try Again
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div>
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full">
                      <FiLoader className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium text-foreground">Designing your revenue-driven content calendar...</span>
                    </div>
                  </div>
                  {/* Skeleton Summary */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] rounded-xl p-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                  {/* Skeleton Weeks */}
                  {[1, 2].map(w => (
                    <div key={w} className="mb-8">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32 mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[1, 2, 3].map(p => (
                          <div key={p} className="bg-white/75 backdrop-blur-[16px] border border-white/[0.18] rounded-xl p-4 space-y-3">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-16" />
                            <div className="flex gap-2"><Skeleton className="h-5 w-32 rounded-full" /><Skeleton className="h-5 w-20 rounded-full" /></div>
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-6 w-28 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && !displayData && !error && (
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <FiCalendar className="h-10 w-10 text-primary/60" />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">Ready to Plan Your Content</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                      Configure your monthly content calendar settings on the left panel to get started. Select your target month, market, goals, and posting frequency, then hit generate to create a revenue-optimized social media calendar.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
                      <span className="flex items-center gap-1"><FiTarget className="h-3.5 w-3.5" />Goal-Driven</span>
                      <span className="flex items-center gap-1"><FiActivity className="h-3.5 w-3.5" />Data-Backed</span>
                      <span className="flex items-center gap-1"><FiSend className="h-3.5 w-3.5" />Ready to Post</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Success State - Calendar Display */}
              {!loading && displayData && (
                <div>
                  {/* Summary Dashboard */}
                  {displayData.summary && <SummaryDashboard summary={displayData.summary} />}

                  {/* Action Bar */}
                  {!showSampleData && (
                    <div className="flex items-center gap-3 mb-6">
                      <Button variant="outline" size="sm" onClick={handleRegenerateFull} disabled={loading} className="h-8 bg-white/50 backdrop-blur-sm border-white/30">
                        <FiRefreshCw className="h-3.5 w-3.5 mr-1.5" />Regenerate Full Month
                      </Button>
                    </div>
                  )}

                  {/* Weekly Blocks */}
                  {displayWeeks.map((week, idx) => (
                    <WeekBlock
                      key={`week-${week?.weekNumber ?? idx}`}
                      week={week}
                      onRegenerate={handleRegenerateWeek}
                      regeneratingWeek={regeneratingWeek}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                      targetMarket={targetMarket}
                      primaryGoal={primaryGoal}
                      heroOffer={heroOffer}
                      postingFrequency={postingFrequency}
                      promotions={promotions}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  )
}
