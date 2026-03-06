"use client";

import { motion } from "framer-motion";
import { CircleDollarSign, ShoppingCart } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { formatPrice } from "@/lib/format";

interface DataCardProps {
  value: number;
  label: string;
  icon: "revenue" | "sales";
  helper: string;
  shouldFormat?: boolean;
}

export const DataCard = ({
  value,
  label,
  icon,
  helper,
  shouldFormat,
}: DataCardProps) => {
  const Icon = icon === "revenue" ? CircleDollarSign : ShoppingCart;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      whileHover={{ y: -1 }}
    >
      <Card className="border-slate-200/80 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            {label}
          </CardTitle>
          <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold tracking-tight text-slate-900">
            {shouldFormat ? formatPrice(value) : value}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {helper}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
