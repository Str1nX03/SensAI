import "../styles/display-cards.css";
import { Sparkles } from "lucide-react";

function DisplayCard({
  className,
  icon = <Sparkles size={16} />,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  variantClass = ""
}) {
  return (
    <div className={`dc-card ${variantClass} ${className || ''}`}>
      <div className="dc-header">
        <span className="dc-icon-box">
          {icon}
        </span>
        <p className="dc-title">{title}</p>
      </div>
      <p className="dc-desc">{description}</p>
      <p className="dc-date">{date}</p>
    </div>
  );
}

export default function DisplayCards({ cards }) {
  
  const cardData = cards && cards.length === 3 ? [
    { ...cards[0], variantClass: "dc-card-1" },
    { ...cards[1], variantClass: "dc-card-2" },
    { ...cards[2], variantClass: "dc-card-3" }
  ] : [
    { variantClass: "dc-card-1", title: "Card 1" },
    { variantClass: "dc-card-2", title: "Card 2" },
    { variantClass: "dc-card-3", title: "Card 3" },
  ];

  return (
    <div className="dc-grid">
      {cardData.map((card, index) => (
        <DisplayCard key={index} {...card} />
      ))}
    </div>
  );
}