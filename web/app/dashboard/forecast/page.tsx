"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ForecastPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">AI Forecast</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Demand predictions powered by machine learning models.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar size={14} />
            Select period
          </Button>
          <Button size="sm">
            <TrendingUp size={14} />
            Generate forecast
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-widest font-medium text-muted-foreground">
                Model accuracy
              </span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="text-2xl font-semibold text-foreground mb-2">94.2%</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on 6 months of historical transaction data across all warehouses.
            </p>
            <div className="w-full bg-secondary rounded-full h-1.5 mt-4 overflow-hidden">
              <div className="bg-success h-1.5 rounded-full" style={{ width: "94.2%" }} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="flex flex-col items-center justify-center text-center py-20">
            <Lightbulb size={32} className="text-muted-foreground mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">
              Forecast visualization coming soon
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              The system needs at least 24 hours of new historical data before rendering predictive charts. Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
