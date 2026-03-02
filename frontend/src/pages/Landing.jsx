import { Link } from 'react-router-dom'
import { Sparkles, FileText, Brain, Zap, Shield, Clock, ArrowRight, Check, Star, MessageSquare, Upload, Search, TrendingUp, Users, Globe, ChevronDown, CheckCircle, XCircle, Loader } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function Landing() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState({})
  const observerRef = useRef(null)
  const [counts, setCounts] = useState({ users: 0, docs: 0, questions: 0, accuracy: 0 })
  const [hasAnimated, setHasAnimated] = useState(false)
  const [contactResult, setContactResult] = useState("")

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
            // Trigger count-up animation when stats section is visible
            if (entry.target.id === 'stats-section' && !hasAnimated) {
              setHasAnimated(true)
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => {
      if (observerRef.current) observerRef.current.observe(el)
    })

    return () => {
      if (observerRef.current) observerRef.current.disconnect()
    }
  }, [])

  // Count-up animation effect
  useEffect(() => {
    if (!hasAnimated) return

    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps

    const targets = { users: 10000, docs: 50000, questions: 1000000, accuracy: 99.8 }
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      
      setCounts({
        users: Math.floor(targets.users * progress),
        docs: Math.floor(targets.docs * progress),
        questions: Math.floor(targets.questions * progress),
        accuracy: (targets.accuracy * progress).toFixed(1)
      })

      if (currentStep >= steps) {
        setCounts({
          users: targets.users,
          docs: targets.docs,
          questions: targets.questions,
          accuracy: targets.accuracy
        })
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [hasAnimated])

  // Contact form submission
  const onSubmitContact = async (event) => {
    event.preventDefault()
    setContactResult("Sending...")
    
    const formData = new FormData(event.target)
    formData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY)

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setContactResult("Message sent successfully! We'll get back to you soon.")
        event.target.reset()
        setTimeout(() => setContactResult(""), 5000)
      } else {
        setContactResult("Something went wrong. Please try again.")
      }
    } catch (error) {
      setContactResult("Failed to send message. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200/30 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-200/30 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-200/30 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text">DocIntel AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">How it Works</a>
            <a href="#testimonials" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Testimonials</a>
            <a href="#about" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">About</a>
            <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="px-5 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6">
        <div className="container mx-auto max-w-7xl text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-50 to-accent-50 border border-primary-200 rounded-full mb-8 hover:shadow-lg transition-shadow cursor-pointer">
            <Star className="w-4 h-4 text-accent-600 animate-pulse-slow" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              AI-Powered Document Intelligence • Free Forever
            </span>
            <Sparkles className="w-4 h-4 text-primary-600 animate-pulse-slow" />
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight" style={{ lineHeight: '1.2' }}>
            <span className="block text-gray-900 mb-2">Transform</span>
            <span className="block bg-gradient-to-r from-primary-600 via-accent-600 to-purple-600 bg-clip-text text-transparent animate-gradient" style={{ lineHeight: '1.2', paddingBottom: '0.1em' }}>
              Documents into Insights
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Upload your PDFs and have intelligent conversations with your documents using advanced AI. 
            Get instant, accurate answers with complete source citations – completely free, forever.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link 
              to="/register" 
              className="group px-10 py-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center gap-3 relative overflow-hidden"
            >
              <span className="relative z-10">Start Free Now</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link 
              to="/login"
              className="px-10 py-5 bg-white border-2 border-gray-300 text-gray-900 rounded-full font-bold text-lg hover:border-gray-900 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Sign In →
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>100% Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Instant Setup</span>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-24 relative">
            {/* Main Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-200 transform hover:scale-[1.02] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50"></div>
              
              <div className="relative p-8 md:p-12">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-gray-100">
                  {/* User Message */}
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-gray-700" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">You asked</div>
                      <div className="text-gray-900 font-semibold text-lg">What are the key findings in my research documents?</div>
                    </div>
                  </div>
                  
                  {/* AI Response */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center flex-shrink-0 animate-glow">
                      <Sparkles className="w-6 h-6 text-white animate-pulse-slow" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">AI Response</div>
                      <div className="text-gray-900 leading-relaxed mb-4 space-y-2">
                        <p className="font-medium">Based on your documents, I found <span className="text-primary-600 font-bold">3 major findings</span>:</p>
                        <ul className="space-y-2 ml-4">
                          <li className="flex items-start gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-green-700">45% efficiency improvement</strong> in processing time</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-yellow-700">60% reduction</strong> in manual data entry</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span><strong className="text-blue-700">98.5% accuracy</strong> in document classification</span>
                          </li>
                        </ul>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl text-sm text-gray-700 border border-gray-200">
                        <FileText className="w-4 h-4 text-primary-600" />
                        <span className="font-medium">Source: research_paper.pdf, Page 12-14</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-accent-400 to-purple-500 rounded-3xl opacity-20 blur-2xl animate-float"></div>
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-primary-400 to-blue-500 rounded-3xl opacity-20 blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-20 animate-bounce">
            <ChevronDown className="w-8 h-8 text-gray-400 mx-auto" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" data-animate className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white border-y border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { key: 'users', number: counts.users >= 1000 ? `${(counts.users / 1000).toFixed(0)}K+` : `${counts.users}+`, label: 'Active Users', icon: Users },
              { key: 'docs', number: counts.docs >= 1000 ? `${(counts.docs / 1000).toFixed(0)}K+` : `${counts.docs}+`, label: 'Documents Processed', icon: FileText },
              { key: 'questions', number: counts.questions >= 1000000 ? `${(counts.questions / 1000000).toFixed(1)}M+` : counts.questions >= 1000 ? `${(counts.questions / 1000).toFixed(0)}K+` : `${counts.questions}+`, label: 'Questions Answered', icon: MessageSquare },
              { key: 'accuracy', number: `${counts.accuracy}%`, label: 'Accuracy Rate', icon: TrendingUp }
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-center group cursor-pointer"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-5xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2 transition-all duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-24" data-animate id="features-header">
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-6 transition-all duration-700 ${isVisible['features-header'] ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <Zap className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-600">POWERFUL FEATURES</span>
            </div>
            <h2 className={`text-5xl md:text-6xl font-black text-gray-900 mb-6 transition-all duration-700 ${isVisible['features-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">work smarter</span>
            </h2>
            <p className={`text-xl text-gray-600 max-w-3xl mx-auto transition-all duration-700 delay-200 ${isVisible['features-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Built for professionals who demand precision, speed, and intelligence
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'Advanced AI',
                description: 'State-of-the-art AI technology with context-aware responses and perfect source attribution.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Advanced vector search technology delivers instant results in milliseconds.',
                gradient: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Enterprise-grade security with local embeddings. Your data never leaves your control.',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: FileText,
                title: 'Multi-Document',
                description: 'Upload and query across unlimited PDFs simultaneously with intelligent cross-referencing.',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: MessageSquare,
                title: 'Natural Conversations',
                description: 'ChatGPT-style interface with session memory for contextual, multi-turn conversations.',
                gradient: 'from-indigo-500 to-purple-500'
              },
              {
                icon: Clock,
                title: 'Complete History',
                description: 'Access full conversation history across sessions with smart search and organization.',
                gradient: 'from-red-500 to-pink-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                data-animate
                id={`feature-${index}`}
                className={`group relative p-8 rounded-3xl bg-white border-2 border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden ${isVisible[`feature-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Icon */}
                <div className={`relative w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="relative text-2xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-gray-900 group-hover:to-gray-700 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="relative text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20" data-animate id="how-it-works-header">
            <h2 className={`text-5xl md:text-6xl font-bold text-gray-900 mb-6 transition-all duration-700 ${isVisible['how-it-works-header'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              Simple to use
            </h2>
            <p className={`text-xl text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-100 ${isVisible['how-it-works-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Get started in minutes with our intuitive workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                number: '01',
                title: 'Upload',
                description: 'Drag and drop your PDF files. Multiple uploads supported.',
                icon: FileText
              },
              {
                number: '02',
                title: 'Process',
                description: 'AI extracts and indexes your content automatically.',
                icon: Brain
              },
              {
                number: '03',
                title: 'Ask',
                description: 'Chat naturally and get instant, accurate answers.',
                icon: Sparkles
              }
            ].map((step, index) => (
              <div 
                key={index} 
                className="relative text-center" 
                data-animate 
                id={`step-${index}`}
              >
                <div className={`w-16 h-16 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-xl font-bold transition-all duration-700 ${isVisible[`step-${index}`] ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-12'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {step.number}
                </div>
                <h3 className={`text-2xl font-semibold text-gray-900 mb-4 transition-all duration-700 ${isVisible[`step-${index}`] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: `${index * 150 + 100}ms` }}
                >
                  {step.title}
                </h3>
                <p className={`text-gray-600 leading-relaxed transition-all duration-700 ${isVisible[`step-${index}`] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                  style={{ transitionDelay: `${index * 150 + 200}ms` }}
                >
                  {step.description}
                </p>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-6 w-6 h-6 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20" data-animate id="testimonials-header">
            <h2 className={`text-5xl md:text-6xl font-bold text-gray-900 mb-6 transition-all duration-700 ${isVisible['testimonials-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Loved by professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Research Scientist',
                content: 'DocIntel AI has revolutionized how I analyze research papers. What used to take hours now takes minutes.',
              },
              {
                name: 'Marcus Rodriguez',
                role: 'Legal Counsel',
                content: 'The accuracy and speed of document analysis is incredible. A game-changer for legal research.',
              },
              {
                name: 'Emily Watson',
                role: 'Product Manager',
                content: 'Finally, a tool that truly understands context. The AI responses are remarkably accurate.',
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                data-animate
                id={`testimonial-${index}`}
                className={`p-8 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all duration-700 hover-lift ${isVisible[`testimonial-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-gray-900 text-gray-900" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16" data-animate id="about-header">
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full mb-6 transition-all duration-700 ${isVisible['about-header'] ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <Users className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-600">ABOUT US</span>
            </div>
            <h2 className={`text-5xl md:text-6xl font-black text-gray-900 mb-6 transition-all duration-700 ${isVisible['about-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Built for <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">modern teams</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div data-animate id="about-content" className={`transition-all duration-700 ${isVisible['about-content'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Making document intelligence accessible to everyone
              </h3>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  DocIntel AI was created to solve a simple problem: professionals spend too much time searching through documents for answers. We believed there had to be a better way.
                </p>
                <p>
                  Using cutting-edge artificial intelligence, we've built a platform that understands your documents like a human would – but with the speed and accuracy of a machine. Whether you're a researcher, lawyer, student, or business professional, DocIntel AI helps you work smarter, not harder.
                </p>
                <p className="font-semibold text-gray-900">
                  Our mission is simple: transform how people interact with documents, making information instantly accessible and actionable.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-gray-200">
                <div>
                  <div className="text-4xl font-black text-primary-600 mb-1">2024</div>
                  <div className="text-sm text-gray-600">Founded</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-accent-600 mb-1">10K+</div>
                  <div className="text-sm text-gray-600">Users</div>
                </div>
                <div>
                  <div className="text-4xl font-black text-purple-600 mb-1">50K+</div>
                  <div className="text-sm text-gray-600">Documents</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div data-animate id="about-visual" className={`relative transition-all duration-700 ${isVisible['about-visual'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 p-8 border-2 border-gray-200">
                <div className="space-y-4">
                  {/* Mission Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-gray-900">Innovation</span>
                    </div>
                    <p className="text-sm text-gray-600">Pushing boundaries with cutting-edge AI technology</p>
                  </div>

                  {/* Values Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-gray-900">Privacy First</span>
                    </div>
                    <p className="text-sm text-gray-600">Your data security is our top priority</p>
                  </div>

                  {/* Community Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-gray-900">User-Centric</span>
                    </div>
                    <p className="text-sm text-gray-600">Built by users, for users, with continuous feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16" data-animate id="contact-header">
            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-accent-50 rounded-full mb-6 transition-all duration-700 ${isVisible['contact-header'] ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
              <MessageSquare className="w-4 h-4 text-accent-600" />
              <span className="text-sm font-semibold text-accent-600">GET IN TOUCH</span>
            </div>
            <h2 className={`text-5xl md:text-6xl font-black text-gray-900 mb-6 transition-all duration-700 ${isVisible['contact-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              We'd love to <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">hear from you</span>
            </h2>
            <p className={`text-xl text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible['contact-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Have questions? Want to share feedback? Our team is here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div data-animate id="contact-form" className={`transition-all duration-700 ${isVisible['contact-form'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
              <form onSubmit={onSubmitContact} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea 
                    rows="5" 
                    name="message"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all resize-none"
                    placeholder="Tell us what you're thinking..."
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={contactResult === "Sending..."}
                  className="w-full px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {contactResult === "Sending..." ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                {contactResult && contactResult !== "Sending..." && (
                  <div className={`p-5 rounded-2xl text-center font-semibold flex items-center justify-center gap-3 animate-bounce-in ${
                    contactResult.includes('success') 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-2 border-green-300 shadow-lg' 
                      : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-2 border-red-300 shadow-lg'
                  }`}>
                    {contactResult.includes('success') ? (
                      <>
                        <CheckCircle className="w-6 h-6 animate-pulse-slow" />
                        <span>{contactResult}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 animate-pulse-slow" />
                        <span>{contactResult}</span>
                      </>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info */}
            <div data-animate id="contact-info" className={`transition-all duration-700 ${isVisible['contact-info'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
              <div className="space-y-8">
                {/* Email */}
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-primary-50 to-white border-2 border-gray-100 hover:border-primary-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Email Us</h4>
                    <p className="text-gray-600 text-sm mb-2">We'll respond within 24 hours</p>
                    <a href="mailto:support@docintel.ai" className="text-primary-600 font-semibold hover:text-primary-700">support@docintel.ai</a>
                  </div>
                </div>

                {/* Support */}
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-accent-50 to-white border-2 border-gray-100 hover:border-accent-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Support Hours</h4>
                    <p className="text-gray-600 text-sm">Monday - Friday: 9am - 6pm EST</p>
                    <p className="text-gray-600 text-sm">Weekend: Limited support</p>
                  </div>
                </div>

                {/* Social */}
                <div className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-white border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Follow Us</h4>
                    <div className="flex gap-3">
                      <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">Twitter</a>
                      <span className="text-gray-300">•</span>
                      <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">LinkedIn</a>
                      <span className="text-gray-300">•</span>
                      <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors">GitHub</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gray-900 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join thousands of professionals transforming how they work with documents
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="px-10 py-5 bg-white text-gray-900 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-gray-400">
              <Check className="w-5 h-5 text-green-400" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            {/* Logo */}
            <div className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">DocIntel AI</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">How it Works</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Testimonials</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors font-medium">Contact</a>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
            <div className="text-gray-600 text-sm">
              © 2026 DocIntel AI. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
              <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
