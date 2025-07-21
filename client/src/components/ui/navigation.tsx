import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  Users, 
  Percent, 
  FileText, 
  BarChart3,
  Star,
  Heart
} from "lucide-react";

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "text-blue-600" },
    { id: "upload", label: "Excel Upload", icon: FileSpreadsheet, color: "text-green-600" },
    { id: "bidders", label: "Bidder Management", icon: Users, color: "text-purple-600" },
    { id: "percentile", label: "Bidder Percentile", icon: Percent, color: "text-orange-600" },
    { id: "generate", label: "Generate Documents", icon: FileText, color: "text-red-600" },
  ];

  return (
    <aside className="w-64 bg-white shadow-md">
      <nav className="mt-6">
        <div className="px-6 mb-8">
          {/* Wish message element */}
          <div className="wish-message">
            <p className="text-sm text-purple-800 font-medium">
              🎉 Efficient Tendering!
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Making procurement transparent & easy
            </p>
          </div>
        </div>
        
        <ul className="space-y-2 px-6">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <Icon className={`mr-3 h-4 w-4 ${isActive ? "text-blue-600" : item.color}`} />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
        
        {/* Decorative elements */}
        <div className="px-6 mt-8">
          <div className="flex items-center justify-center space-x-2 py-4">
            <Heart className="celebration-heart animate-float" />
            <Star className="celebration-star" />
            <Heart className="celebration-heart animate-float" style={{ animationDelay: "1s" }} />
          </div>
        </div>
      </nav>
    </aside>
  );
}
