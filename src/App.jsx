import React, { useState, useEffect } from "react";
import {
  Activity,
  Dumbbell,
  Apple,
  Moon,
  Heart,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  BarChart3,
  Utensils,
  Target,
  Clock,
  Flame,
  Droplet,
  Zap,
  AlertCircle,
  Bell,
  Calendar,
  Award,
} from "lucide-react";

export default function FitnessTrackerApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMenu, setShowMenu] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    height: "",
    goal: "fitness",
  });
  const [isSignup, setIsSignup] = useState(false);

  // Data states
  const [workouts, setWorkouts] = useState([]);
  const [meals, setMeals] = useState([]);
  const [sleepLogs, setSleepLogs] = useState([]);
  const [heartRates, setHeartRates] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Form states
  const [newWorkout, setNewWorkout] = useState({
    type: "",
    exercise: "",
    duration: "",
    calories: "",
    sets: "",
    reps: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [newMeal, setNewMeal] = useState({
    name: "",
    type: "breakfast",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [newSleep, setNewSleep] = useState({
    hours: "",
    quality: "good",
    bedTime: "",
    wakeTime: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [newHeartRate, setNewHeartRate] = useState({
    rate: "",
    type: "resting",
    date: new Date().toISOString().split("T")[0],
  });

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser || !token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        const [workoutsRes, mealsRes, sleepRes, heartRes, actRes] = await Promise.all([
          fetch('/api/workouts', { headers }),
          fetch('/api/meals', { headers }),
          fetch('/api/sleep', { headers }),
          fetch('/api/heart-rates', { headers }),
          fetch('/api/activities', { headers })
        ]);

        if (workoutsRes.ok) setWorkouts(await workoutsRes.json());
        if (mealsRes.ok) setMeals(await mealsRes.json());
        if (sleepRes.ok) setSleepLogs(await sleepRes.json());
        if (heartRes.ok) setHeartRates(await heartRes.json());
        if (actRes.ok) setActivities(await actRes.json());
        
        // Notifications can still be local for simplicity or loaded if we add an endpoint for it. We'll leave them empty initially.
      } catch (error) {
        console.error("Loading data error:", error);
      }
    };

    if (token && !currentUser) {
      // Typically we'd fetch the user profile here, but for now we expect login/signup to set the user
    }

    loadData();
  }, [currentUser, token]);

  // Check daily reminders
  useEffect(() => {
    if (!currentUser) return;

    const checkReminders = () => {
      const today = new Date().toDateString();
      const todayWorkouts = workouts.filter(
        (w) => new Date(w.date).toDateString() === today,
      );
      const todayMeals = meals.filter(
        (m) => new Date(m.date).toDateString() === today,
      );

      const newNotifs = [];
      if (todayWorkouts.length === 0) {
        newNotifs.push({
          id: Date.now(),
          type: "workout",
          message: "Time to log your workout! 💪",
          time: new Date(),
        });
      }
      if (todayMeals.length < 3) {
        newNotifs.push({
          id: Date.now() + 1,
          type: "meal",
          message: "Remember to log your meals today 🍎",
          time: new Date(),
        });
      }

      if (newNotifs.length > 0 && notifications.length < 5) {
        const updated = [...newNotifs, ...notifications].slice(0, 5);
        setNotifications(updated);
        localStorage.setItem(`notifications_${currentUser.email}`, JSON.stringify(updated));
      }
    };

    const interval = setInterval(checkReminders, 3600000); // Check every hour
    checkReminders();

    return () => clearInterval(interval);
  }, [currentUser, workouts, meals, notifications]);

  // Authentication
  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();
      
      if (response.ok) {
        setCurrentUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setLoginForm({ email: "", password: "" });
      } else {
        alert(data.error || "Invalid credentials");
      }
    } catch (error) {
      alert("Connection error");
    }
  };

  const handleSignup = async () => {
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      alert("Please fill in required fields");
      return;
    }

    const newUser = {
      ...signupForm,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await response.json();
      
      if (response.ok) {
        setCurrentUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setSignupForm({
          name: "", email: "", password: "", age: "", weight: "", height: "", goal: "fitness",
        });
        setIsSignup(false);
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (error) {
      alert("Connection error");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setActiveTab("dashboard");
  };

  // Add workout
  const addWorkout = async () => {
    if (!newWorkout.type || !newWorkout.duration) {
      alert("Please fill required fields");
      return;
    }

    const workout = {
      ...newWorkout,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(workout)
      });
      if (res.ok) {
        const savedWorkout = await res.json();
        setWorkouts([savedWorkout, ...workouts]);

        // Log activity
        const activity = {
          type: "workout",
          description: `Completed ${newWorkout.type} - ${newWorkout.exercise}`,
          time: new Date().toISOString(),
        };
        const actRes = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(activity)
        });
        if (actRes.ok) {
          const savedActivity = await actRes.json();
          setActivities([savedActivity, ...activities].slice(0, 50));
        }
      }
    } catch(err) { console.error('Error saving workout', err); }

    setNewWorkout({
      type: "",
      exercise: "",
      duration: "",
      calories: "",
      sets: "",
      reps: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  // Add meal
  const addMeal = async () => {
    if (!newMeal.name || !newMeal.calories) {
      alert("Please fill required fields");
      return;
    }

    const meal = {
      ...newMeal,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(meal)
      });
      if (res.ok) {
        const savedMeal = await res.json();
        setMeals([savedMeal, ...meals]);

        // Log activity
        const activity = {
          type: "meal",
          description: `Logged ${newMeal.type}: ${newMeal.name}`,
          time: new Date().toISOString(),
        };
        const actRes = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(activity)
        });
        if (actRes.ok) {
          const savedActivity = await actRes.json();
          setActivities([savedActivity, ...activities].slice(0, 50));
        }
      }
    } catch(err) { console.error('Error saving meal', err); }

    setNewMeal({
      name: "",
      type: "breakfast",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Add sleep log
  const addSleep = async () => {
    if (!newSleep.hours) {
      alert("Please enter sleep hours");
      return;
    }

    const sleep = {
      ...newSleep,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(sleep)
      });
      if (res.ok) {
        const savedSleep = await res.json();
        setSleepLogs([savedSleep, ...sleepLogs]);

        // Log activity
        const activity = {
          type: "sleep",
          description: `Logged ${newSleep.hours} hours of ${newSleep.quality} sleep`,
          time: new Date().toISOString(),
        };
        const actRes = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(activity)
        });
        if (actRes.ok) {
          const savedActivity = await actRes.json();
          setActivities([savedActivity, ...activities].slice(0, 50));
        }
      }
    } catch(err) { console.error('Error saving sleep', err); }

    setNewSleep({
      hours: "",
      quality: "good",
      bedTime: "",
      wakeTime: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Add heart rate
  const addHeartRate = async () => {
    if (!newHeartRate.rate) {
      alert("Please enter heart rate");
      return;
    }

    const heart = {
      ...newHeartRate,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/heart-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(heart)
      });
      if (res.ok) {
        const savedHeartRate = await res.json();
        setHeartRates([savedHeartRate, ...heartRates]);

        const activity = {
          type: "heart",
          description: `Recorded ${newHeartRate.type} heart rate: ${newHeartRate.rate} bpm`,
          time: new Date().toISOString(),
        };
        const actRes = await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(activity)
        });
        if (actRes.ok) {
          const savedActivity = await actRes.json();
          setActivities([savedActivity, ...activities].slice(0, 50));
        }
      }
    } catch(err) { console.error('Error saving heart rate', err); }

    setNewHeartRate({
      rate: "",
      type: "resting",
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Calculate comprehensive stats
  const getStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekWorkouts = workouts.filter((w) => new Date(w.date) >= weekAgo);
    const weekMeals = meals.filter((m) => new Date(m.date) >= weekAgo);
    const weekSleep = sleepLogs.filter((s) => new Date(s.date) >= weekAgo);
    const weekHeart = heartRates.filter((h) => new Date(h.date) >= weekAgo);

    const totalCaloriesBurned = weekWorkouts.reduce(
      (sum, w) => sum + (parseInt(w.calories) || 0),
      0,
    );
    const totalCaloriesConsumed = weekMeals.reduce(
      (sum, m) => sum + (parseInt(m.calories) || 0),
      0,
    );
    const totalProtein = weekMeals.reduce(
      (sum, m) => sum + (parseInt(m.protein) || 0),
      0,
    );
    const avgSleep =
      weekSleep.length > 0
        ? (
            weekSleep.reduce((sum, s) => sum + parseFloat(s.hours), 0) /
            weekSleep.length
          ).toFixed(1)
        : 0;
    const avgHeartRate =
      weekHeart.length > 0
        ? Math.round(
            weekHeart.reduce((sum, h) => sum + parseInt(h.rate), 0) /
              weekHeart.length,
          )
        : 0;
    const workoutMinutes = weekWorkouts.reduce(
      (sum, w) => sum + (parseInt(w.duration) || 0),
      0,
    );

    return {
      totalWorkouts: weekWorkouts.length,
      totalCaloriesBurned,
      totalCaloriesConsumed,
      netCalories: totalCaloriesConsumed - totalCaloriesBurned,
      totalProtein,
      avgSleep,
      avgHeartRate,
      workoutMinutes,
      weekWorkouts,
      weekMeals,
      weekSleep,
    };
  };

  const stats = currentUser ? getStats() : null;

  // Login/Signup Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-white/20">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
              <Dumbbell className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              FitLife Pro
            </h1>
            <p className="text-gray-600 mt-2">
              Complete Fitness & Health Tracker
            </p>
          </div>

          {!isSignup ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition bg-white/80"
                  placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition bg-white/80"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition"
              >
                Login to Your Journey
              </button>
              <p className="text-center text-gray-600">
                New to FitLife?{" "}
                <button
                  onClick={() => setIsSignup(true)}
                  className="text-purple-600 font-bold hover:underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition bg-white/80"
                    placeholder="John Doe"
                    value={signupForm.name}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition bg-white/80"
                    placeholder="25"
                    value={signupForm.age}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, age: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition bg-white/80"
                  placeholder="your@email.com"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, email: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition bg-white/80"
                  placeholder="••••••••"
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, password: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition bg-white/80"
                    placeholder="70"
                    value={signupForm.weight}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, weight: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition bg-white/80"
                    placeholder="175"
                    value={signupForm.height}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, height: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fitness Goal
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none transition bg-white/80"
                  value={signupForm.goal}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, goal: e.target.value })
                  }
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="fitness">General Fitness</option>
                  <option value="endurance">Endurance</option>
                  <option value="health">Health & Wellness</option>
                </select>
              </div>
              <button
                onClick={handleSignup}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition"
              >
                Start Your Journey
              </button>
              <p className="text-center text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignup(false)}
                  className="text-purple-600 font-bold hover:underline"
                >
                  Login
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b-2 border-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              FitLife Pro
            </h1>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium ${activeTab === "dashboard" ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700" : "hover:bg-gray-100"}`}
            >
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("workout")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium ${activeTab === "workout" ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700" : "hover:bg-gray-100"}`}
            >
              <Activity className="w-4 h-4" />
              Workout
            </button>
            <button
              onClick={() => setActiveTab("diet")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium ${activeTab === "diet" ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700" : "hover:bg-gray-100"}`}
            >
              <Apple className="w-4 h-4" />
              Nutrition
            </button>
            <button
              onClick={() => setActiveTab("sleep")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium ${activeTab === "sleep" ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700" : "hover:bg-gray-100"}`}
            >
              <Moon className="w-4 h-4" />
              Sleep
            </button>
            <button
              onClick={() => setActiveTab("health")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition font-medium ${activeTab === "health" ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700" : "hover:bg-gray-100"}`}
            >
              <Heart className="w-4 h-4" />
              Health
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 px-4 py-2 rounded-xl border-2 border-purple-200">
              <User className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-700">
                {currentUser.name}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-100 rounded-xl transition text-red-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
            >
              {showMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="lg:hidden bg-white border-t px-4 py-3 space-y-2">
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setShowMenu(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl ${activeTab === "dashboard" ? "bg-purple-100 text-purple-700" : ""}`}
            >
              <TrendingUp className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTab("workout");
                setShowMenu(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl ${activeTab === "workout" ? "bg-purple-100 text-purple-700" : ""}`}
            >
              <Activity className="w-4 h-4" />
              Workout
            </button>
            <button
              onClick={() => {
                setActiveTab("diet");
                setShowMenu(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl ${activeTab === "diet" ? "bg-purple-100 text-purple-700" : ""}`}
            >
              <Apple className="w-4 h-4" />
              Nutrition
            </button>
            <button
              onClick={() => {
                setActiveTab("sleep");
                setShowMenu(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl ${activeTab === "sleep" ? "bg-purple-100 text-purple-700" : ""}`}
            >
              <Moon className="w-4 h-4" />
              Sleep
            </button>
            <button
              onClick={() => {
                setActiveTab("health");
                setShowMenu(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl ${activeTab === "health" ? "bg-purple-100 text-purple-700" : ""}`}
            >
              <Heart className="w-4 h-4" />
              Health
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-800">
                  Hey {currentUser.name}! 👋
                </h2>
                <p className="text-gray-600 mt-1">
                  Here's your weekly fitness summary
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-lg">
                  <p className="text-sm opacity-90">Goal</p>
                  <p className="text-lg font-bold capitalize">
                    {currentUser.goal?.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-2">Reminders</h3>
                    <div className="space-y-2">
                      {notifications.slice(0, 2).map((notif) => (
                        <p key={notif.id} className="text-sm text-gray-700">
                          {notif.message}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition">
                <Activity className="w-10 h-10 mb-3 opacity-90" />
                <p className="text-indigo-100 text-sm font-medium">
                  Weekly Workouts
                </p>
                <p className="text-5xl font-bold mt-2">{stats.totalWorkouts}</p>
                <p className="text-indigo-100 text-xs mt-2">
                  {stats.workoutMinutes} minutes total
                </p>
              </div>
              <div className="bg-gradient-to-br from-rose-400 via-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition">
                <Flame className="w-10 h-10 mb-3 opacity-90" />
                <p className="text-pink-100 text-sm font-medium">
                  Calories Burned
                </p>
                <p className="text-5xl font-bold mt-2">
                  {stats.totalCaloriesBurned}
                </p>
                <p className="text-pink-100 text-xs mt-2">This week</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition">
                <Apple className="w-10 h-10 mb-3 opacity-90" />
                <p className="text-green-100 text-sm font-medium">
                  Net Calories
                </p>
                <p className="text-5xl font-bold mt-2">
                  {stats.netCalories > 0 ? "+" : ""}
                  {stats.netCalories}
                </p>
                <p className="text-green-100 text-xs mt-2">Consumed - Burned</p>
              </div>
              <div className="bg-gradient-to-br from-violet-400 via-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition">
                <Moon className="w-10 h-10 mb-3 opacity-90" />
                <p className="text-purple-100 text-sm font-medium">Avg Sleep</p>
                <p className="text-5xl font-bold mt-2">
                  {stats.avgSleep}
                  <span className="text-2xl">h</span>
                </p>
                <p className="text-purple-100 text-xs mt-2">Per night</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-3xl font-bold text-orange-600">
                    {stats.totalProtein}g
                  </span>
                </div>
                <p className="text-gray-700 font-semibold">Total Protein</p>
                <p className="text-sm text-gray-500">This week</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-3xl font-bold text-red-600">
                    {stats.avgHeartRate || "--"}
                  </span>
                </div>
                <p className="text-gray-700 font-semibold">Avg Heart Rate</p>
                <p className="text-sm text-gray-500">Beats per minute</p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-3xl font-bold text-blue-600">
                    {Math.min(100, Math.round((stats.totalWorkouts / 5) * 100))}
                    %
                  </span>
                </div>
                <p className="text-gray-700 font-semibold">Weekly Goal</p>
                <p className="text-sm text-gray-500">
                  {stats.totalWorkouts}/5 workouts
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Bell className="w-6 h-6 text-purple-600" />
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No activities yet</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Start logging your fitness journey!
                    </p>
                  </div>
                ) : (
                  activities.map((activity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 rounded-xl border border-purple-100 hover:shadow-md transition"
                    >
                      <div
                        className={`p-3 rounded-xl ${
                          activity.type === "workout"
                            ? "bg-indigo-200"
                            : activity.type === "meal"
                              ? "bg-pink-200"
                              : activity.type === "sleep"
                                ? "bg-purple-200"
                                : "bg-red-200"
                        }`}
                      >
                        {activity.type === "workout" ? (
                          <Activity className="w-5 h-5 text-indigo-700" />
                        ) : activity.type === "meal" ? (
                          <Apple className="w-5 h-5 text-pink-700" />
                        ) : activity.type === "sleep" ? (
                          <Moon className="w-5 h-5 text-purple-700" />
                        ) : (
                          <Heart className="w-5 h-5 text-red-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weekly Summary Chart */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Weekly Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Top Workouts
                  </h4>
                  {stats.weekWorkouts.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No workouts this week
                    </p>
                  ) : (
                    stats.weekWorkouts.slice(0, 3).map((w, i) => (
                      <div key={i} className="p-3 bg-indigo-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-800">
                          {w.type}
                        </p>
                        <p className="text-xs text-gray-600">
                          {w.duration} min • {w.calories} cal
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Recent Meals
                  </h4>
                  {stats.weekMeals.length === 0 ? (
                    <p className="text-sm text-gray-500">No meals logged</p>
                  ) : (
                    stats.weekMeals.slice(0, 3).map((m, i) => (
                      <div key={i} className="p-3 bg-pink-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-800">
                          {m.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {m.calories} cal • {m.protein}g protein
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Sleep Pattern
                  </h4>
                  {stats.weekSleep.length === 0 ? (
                    <p className="text-sm text-gray-500">No sleep data</p>
                  ) : (
                    stats.weekSleep.slice(0, 3).map((s, i) => (
                      <div key={i} className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-800">
                          {s.hours} hours
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          {s.quality} quality
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Workout Tab */}
        {activeTab === "workout" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-800">
                  Workout Logger 💪
                </h2>
                <p className="text-gray-600 mt-1">
                  Track your exercises and progress
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-3 rounded-xl border-2 border-purple-200">
                <Dumbbell className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">This Week</p>
                  <p className="text-lg font-bold text-purple-700">
                    {stats.totalWorkouts} Workouts
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Add New Workout
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <select
                  className="px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none bg-white font-medium"
                  value={newWorkout.type}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, type: e.target.value })
                  }
                >
                  <option value="">Select Workout Type</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Strength">Strength Training</option>
                  <option value="Yoga">Yoga</option>
                  <option value="HIIT">HIIT</option>
                  <option value="Running">Running</option>
                  <option value="Cycling">Cycling</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Exercise Name"
                  className="px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none"
                  value={newWorkout.exercise}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, exercise: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Duration (minutes)"
                  className="px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none"
                  value={newWorkout.duration}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, duration: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Calories Burned"
                  className="px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none"
                  value={newWorkout.calories}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, calories: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Sets (optional)"
                  className="px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none"
                  value={newWorkout.sets}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, sets: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Reps (optional)"
                  className="px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none"
                  value={newWorkout.reps}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, reps: e.target.value })
                  }
                />
                <input
                  type="date"
                  className="px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none"
                  value={newWorkout.date}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, date: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Notes (optional)"
                  className="px-4 py-3 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:outline-none md:col-span-2"
                  value={newWorkout.notes}
                  onChange={(e) =>
                    setNewWorkout({ ...newWorkout, notes: e.target.value })
                  }
                />
              </div>
              <button
                onClick={addWorkout}
                className="mt-4 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Log Workout
              </button>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Workout History
              </h3>
              <div className="space-y-3">
                {workouts.length === 0 ? (
                  <div className="text-center py-12">
                    <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      No workouts logged yet
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Start your fitness journey today!
                    </p>
                  </div>
                ) : (
                  workouts
                    .slice()
                    .reverse()
                    .map((workout) => (
                      <div
                        key={workout.id}
                        className="p-5 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-lg transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-200 rounded-xl">
                              <Activity className="w-6 h-6 text-indigo-700" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-lg">
                                {workout.type}
                              </p>
                              <p className="text-sm text-gray-600">
                                {workout.exercise}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            {new Date(workout.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <div className="bg-white/70 rounded-lg p-2">
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="font-bold text-gray-800">
                              {workout.duration} min
                            </p>
                          </div>
                          <div className="bg-white/70 rounded-lg p-2">
                            <p className="text-xs text-gray-500">Calories</p>
                            <p className="font-bold text-gray-800">
                              {workout.calories} cal
                            </p>
                          </div>
                          {workout.sets && (
                            <div className="bg-white/70 rounded-lg p-2">
                              <p className="text-xs text-gray-500">Sets</p>
                              <p className="font-bold text-gray-800">
                                {workout.sets}
                              </p>
                            </div>
                          )}
                          {workout.reps && (
                            <div className="bg-white/70 rounded-lg p-2">
                              <p className="text-xs text-gray-500">Reps</p>
                              <p className="font-bold text-gray-800">
                                {workout.reps}
                              </p>
                            </div>
                          )}
                        </div>
                        {workout.notes && (
                          <div className="mt-3 p-3 bg-white/50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm text-gray-700">
                              {workout.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Diet/Nutrition Tab */}
        {activeTab === "diet" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-800">
                  Nutrition Tracker 🍎
                </h2>
                <p className="text-gray-600 mt-1">
                  Monitor your daily nutrition and calories
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-pink-100 to-orange-100 px-6 py-3 rounded-xl border-2 border-pink-200">
                <Utensils className="w-5 h-5 text-pink-600" />
                <div>
                  <p className="text-xs text-gray-600">This Week</p>
                  <p className="text-lg font-bold text-pink-700">
                    {stats.totalCaloriesConsumed} cal
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-pink-600" />
                Log Your Meal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Meal/Food Name"
                  className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  value={newMeal.name}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, name: e.target.value })
                  }
                />
                <select
                  className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none bg-white font-medium"
                  value={newMeal.type}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, type: e.target.value })
                  }
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                  <option value="pre-workout">Pre-Workout</option>
                  <option value="post-workout">Post-Workout</option>
                </select>
                <input
                  type="number"
                  placeholder="Calories"
                  className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  value={newMeal.calories}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, calories: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Protein (g)"
                  className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  value={newMeal.protein}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, protein: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Carbs (g)"
                  className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  value={newMeal.carbs}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, carbs: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Fats (g)"
                  className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  value={newMeal.fats}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, fats: e.target.value })
                  }
                />
                <input
                  type="date"
                  className="px-4 py-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none md:col-span-2"
                  value={newMeal.date}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, date: e.target.value })
                  }
                />
              </div>
              <button
                onClick={addMeal}
                className="mt-4 w-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white py-4 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Meal
              </button>
            </div>

            {/* Nutrition Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
                <Zap className="w-8 h-8 mb-3 opacity-90" />
                <p className="text-orange-100 text-sm">Total Protein</p>
                <p className="text-4xl font-bold mt-2">{stats.totalProtein}g</p>
              </div>
              <div className="bg-gradient-to-br from-pink-400 to-rose-600 rounded-2xl p-6 text-white shadow-xl">
                <Flame className="w-8 h-8 mb-3 opacity-90" />
                <p className="text-pink-100 text-sm">Calories In</p>
                <p className="text-4xl font-bold mt-2">
                  {stats.totalCaloriesConsumed}
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-400 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                <Target className="w-8 h-8 mb-3 opacity-90" />
                <p className="text-green-100 text-sm">Net Balance</p>
                <p className="text-4xl font-bold mt-2">
                  {stats.netCalories > 0 ? "+" : ""}
                  {stats.netCalories}
                </p>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-600" />
                Meal History
              </h3>
              <div className="space-y-3">
                {meals.length === 0 ? (
                  <div className="text-center py-12">
                    <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No meals logged yet</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Start tracking your nutrition!
                    </p>
                  </div>
                ) : (
                  meals
                    .slice()
                    .reverse()
                    .map((meal) => (
                      <div
                        key={meal.id}
                        className="p-5 bg-gradient-to-r from-pink-50 via-rose-50 to-orange-50 rounded-xl border border-pink-200 hover:shadow-lg transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-pink-200 rounded-xl">
                              <Utensils className="w-6 h-6 text-pink-700" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-lg">
                                {meal.name}
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                {meal.type}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            {new Date(meal.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <div className="bg-white/70 rounded-lg p-2">
                            <p className="text-xs text-gray-500">Calories</p>
                            <p className="font-bold text-gray-800">
                              {meal.calories}
                            </p>
                          </div>
                          {meal.protein && (
                            <div className="bg-white/70 rounded-lg p-2">
                              <p className="text-xs text-gray-500">Protein</p>
                              <p className="font-bold text-gray-800">
                                {meal.protein}g
                              </p>
                            </div>
                          )}
                          {meal.carbs && (
                            <div className="bg-white/70 rounded-lg p-2">
                              <p className="text-xs text-gray-500">Carbs</p>
                              <p className="font-bold text-gray-800">
                                {meal.carbs}g
                              </p>
                            </div>
                          )}
                          {meal.fats && (
                            <div className="bg-white/70 rounded-lg p-2">
                              <p className="text-xs text-gray-500">Fats</p>
                              <p className="font-bold text-gray-800">
                                {meal.fats}g
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sleep Tab */}
        {activeTab === "sleep" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-800">
                  Sleep Tracker 😴
                </h2>
                <p className="text-gray-600 mt-1">
                  Monitor your sleep patterns and quality
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-purple-100 to-indigo-100 px-6 py-3 rounded-xl border-2 border-purple-200">
                <Moon className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-xs text-gray-600">Avg Sleep</p>
                  <p className="text-lg font-bold text-purple-700">
                    {stats.avgSleep} hours
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Log Your Sleep
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="number"
                  step="0.5"
                  placeholder="Hours of Sleep"
                  className="px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                  value={newSleep.hours}
                  onChange={(e) =>
                    setNewSleep({ ...newSleep, hours: e.target.value })
                  }
                />
                <select
                  className="px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none bg-white font-medium"
                  value={newSleep.quality}
                  onChange={(e) =>
                    setNewSleep({ ...newSleep, quality: e.target.value })
                  }
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
                <input
                  type="time"
                  placeholder="Bed Time"
                  className="px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                  value={newSleep.bedTime}
                  onChange={(e) =>
                    setNewSleep({ ...newSleep, bedTime: e.target.value })
                  }
                />
                <input
                  type="time"
                  placeholder="Wake Time"
                  className="px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                  value={newSleep.wakeTime}
                  onChange={(e) =>
                    setNewSleep({ ...newSleep, wakeTime: e.target.value })
                  }
                />
                <input
                  type="date"
                  className="px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
                  value={newSleep.date}
                  onChange={(e) =>
                    setNewSleep({ ...newSleep, date: e.target.value })
                  }
                />
              </div>
              <button
                onClick={addSleep}
                className="mt-4 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white py-4 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Log Sleep
              </button>
            </div>

            {/* Sleep Insights */}
            {sleepLogs.length > 0 && (
              <div className="bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Sleep Insights
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-purple-100 text-sm">Weekly Avg</p>
                    <p className="text-4xl font-bold mt-2">
                      {stats.avgSleep}
                      <span className="text-xl">h</span>
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-purple-100 text-sm">Total Logs</p>
                    <p className="text-4xl font-bold mt-2">
                      {sleepLogs.length}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-purple-100 text-sm">This Week</p>
                    <p className="text-4xl font-bold mt-2">
                      {stats.weekSleep.length}
                    </p>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-purple-100 text-sm">Quality</p>
                    <p className="text-2xl font-bold mt-2 capitalize">
                      {sleepLogs[sleepLogs.length - 1]?.quality || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                  <p className="text-purple-100 text-sm mb-2">
                    Sleep Recommendation
                  </p>
                  <p className="text-white">
                    {parseFloat(stats.avgSleep) >= 7
                      ? "🌟 Excellent! You're getting adequate sleep for optimal recovery and health."
                      : parseFloat(stats.avgSleep) >= 6
                        ? "⚠️ Try to get at least 7-9 hours of sleep for better recovery and performance."
                        : "❗ Your sleep is below recommended levels. Prioritize 7-9 hours for optimal health."}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Sleep History
              </h3>
              <div className="space-y-3">
                {sleepLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Moon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No sleep logs yet</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Start tracking your sleep patterns!
                    </p>
                  </div>
                ) : (
                  sleepLogs
                    .slice()
                    .reverse()
                    .map((sleep) => (
                      <div
                        key={sleep.id}
                        className="p-5 bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-xl border border-purple-200 hover:shadow-lg transition"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-200 rounded-xl">
                              <Moon className="w-6 h-6 text-purple-700" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-2xl">
                                {sleep.hours} hours
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                Quality: {sleep.quality}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            {new Date(sleep.date).toLocaleDateString()}
                          </p>
                        </div>
                        {(sleep.bedTime || sleep.wakeTime) && (
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            {sleep.bedTime && (
                              <div className="bg-white/70 rounded-lg p-3">
                                <p className="text-xs text-gray-500">
                                  Bed Time
                                </p>
                                <p className="font-bold text-gray-800">
                                  {sleep.bedTime}
                                </p>
                              </div>
                            )}
                            {sleep.wakeTime && (
                              <div className="bg-white/70 rounded-lg p-3">
                                <p className="text-xs text-gray-500">
                                  Wake Time
                                </p>
                                <p className="font-bold text-gray-800">
                                  {sleep.wakeTime}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Health/Heart Rate Tab */}
        {activeTab === "health" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-800">
                  Health Monitor ❤️
                </h2>
                <p className="text-gray-600 mt-1">
                  Track your heart rate and vital signs
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-red-100 to-pink-100 px-6 py-3 rounded-xl border-2 border-red-200">
                <Heart className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-xs text-gray-600">Avg Heart Rate</p>
                  <p className="text-lg font-bold text-red-700">
                    {stats.avgHeartRate || "--"} bpm
                  </p>
                </div>
              </div>
            </div>

            {/* User Profile Info */}
            <div className="bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                Your Profile
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentUser.age && (
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-cyan-100 text-sm">Age</p>
                    <p className="text-3xl font-bold mt-2">{currentUser.age}</p>
                  </div>
                )}
                {currentUser.weight && (
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-cyan-100 text-sm">Weight</p>
                    <p className="text-3xl font-bold mt-2">
                      {currentUser.weight}
                      <span className="text-lg">kg</span>
                    </p>
                  </div>
                )}
                {currentUser.height && (
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-cyan-100 text-sm">Height</p>
                    <p className="text-3xl font-bold mt-2">
                      {currentUser.height}
                      <span className="text-lg">cm</span>
                    </p>
                  </div>
                )}
                {currentUser.weight && currentUser.height && (
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-cyan-100 text-sm">BMI</p>
                    <p className="text-3xl font-bold mt-2">
                      {(
                        currentUser.weight /
                        Math.pow(currentUser.height / 100, 2)
                      ).toFixed(1)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-red-600" />
                Record Heart Rate
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Heart Rate (bpm)"
                  className="px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 focus:outline-none"
                  value={newHeartRate.rate}
                  onChange={(e) =>
                    setNewHeartRate({ ...newHeartRate, rate: e.target.value })
                  }
                />
                <select
                  className="px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 focus:outline-none bg-white font-medium"
                  value={newHeartRate.type}
                  onChange={(e) =>
                    setNewHeartRate({ ...newHeartRate, type: e.target.value })
                  }
                >
                  <option value="resting">Resting</option>
                  <option value="active">Active</option>
                  <option value="post-workout">Post-Workout</option>
                  <option value="peak">Peak Exercise</option>
                </select>
                <input
                  type="date"
                  className="px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 focus:outline-none"
                  value={newHeartRate.date}
                  onChange={(e) =>
                    setNewHeartRate({ ...newHeartRate, date: e.target.value })
                  }
                />
              </div>
              <button
                onClick={addHeartRate}
                className="mt-4 w-full bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white py-4 rounded-xl font-bold hover:shadow-2xl transform hover:scale-105 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Record Heart Rate
              </button>
            </div>

            {/* Heart Rate Stats */}
            {heartRates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-6 text-white shadow-xl">
                  <Heart className="w-8 h-8 mb-3 opacity-90" />
                  <p className="text-red-100 text-sm">Average BPM</p>
                  <p className="text-4xl font-bold mt-2">
                    {stats.avgHeartRate}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                  <TrendingUp className="w-8 h-8 mb-3 opacity-90" />
                  <p className="text-pink-100 text-sm">Total Records</p>
                  <p className="text-4xl font-bold mt-2">{heartRates.length}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl p-6 text-white shadow-xl">
                  <Activity className="w-8 h-8 mb-3 opacity-90" />
                  <p className="text-rose-100 text-sm">Latest Reading</p>
                  <p className="text-4xl font-bold mt-2">
                    {heartRates[heartRates.length - 1]?.rate}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-purple-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                Heart Rate History
              </h3>
              <div className="space-y-3">
                {heartRates.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      No heart rate data yet
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Start monitoring your heart health!
                    </p>
                  </div>
                ) : (
                  heartRates
                    .slice()
                    .reverse()
                    .map((heart) => (
                      <div
                        key={heart.id}
                        className="p-5 bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 rounded-xl border border-red-200 hover:shadow-lg transition"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-200 rounded-xl">
                              <Heart className="w-6 h-6 text-red-700" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-2xl">
                                {heart.rate}{" "}
                                <span className="text-lg">bpm</span>
                              </p>
                              <p className="text-sm text-gray-600 capitalize">
                                {heart.type.replace("-", " ")}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">
                            {new Date(heart.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Health Tips */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-green-600" />
                Health Tips
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-white/70 rounded-xl">
                  <p className="text-sm font-semibold text-gray-800">
                    💪 Stay Active
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Aim for at least 150 minutes of moderate aerobic activity
                    per week
                  </p>
                </div>
                <div className="p-4 bg-white/70 rounded-xl">
                  <p className="text-sm font-semibold text-gray-800">
                    🥗 Balanced Diet
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Include plenty of fruits, vegetables, lean proteins, and
                    whole grains
                  </p>
                </div>
                <div className="p-4 bg-white/70 rounded-xl">
                  <p className="text-sm font-semibold text-gray-800">
                    😴 Quality Sleep
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Get 7-9 hours of sleep each night for optimal recovery
                  </p>
                </div>
                <div className="p-4 bg-white/70 rounded-xl">
                  <p className="text-sm font-semibold text-gray-800">
                    💧 Stay Hydrated
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Drink at least 8 glasses of water daily
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-xl mt-12 py-8 border-t-2 border-purple-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-700 font-bold text-lg">
              FitLife Pro - Your Complete Fitness Companion 💪
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Track workouts • Monitor nutrition • Optimize sleep • Stay healthy
            </p>
            <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Activity className="w-4 h-4" /> Workouts
              </span>
              <span className="flex items-center gap-1">
                <Apple className="w-4 h-4" /> Nutrition
              </span>
              <span className="flex items-center gap-1">
                <Moon className="w-4 h-4" /> Sleep
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" /> Health
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
