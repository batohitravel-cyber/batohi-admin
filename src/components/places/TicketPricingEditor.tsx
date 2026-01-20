
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';

interface PricingItem {
    label: string;
    age_range?: string;
    price: number;
}

interface TicketPricing {
    currency: string;
    pricing_type: string;
    prices: PricingItem[];
}

interface TicketPricingEditorProps {
    value: TicketPricing | null;
    onChange: (value: TicketPricing) => void;
}

const DEFAULT_PRICING: TicketPricing = {
    currency: 'INR',
    pricing_type: 'category_based',
    prices: [
        { label: 'Adults', price: 0 }
    ]
};

export function TicketPricingEditor({ value, onChange }: TicketPricingEditorProps) {
    const [pricing, setPricing] = useState<TicketPricing>(value || DEFAULT_PRICING);

    useEffect(() => {
        if (value) {
            setPricing(value);
        }
    }, [value]);

    const updateField = (field: keyof TicketPricing, val: any) => {
        const updated = { ...pricing, [field]: val };
        setPricing(updated);
        onChange(updated);
    };

    const addPriceRow = () => {
        const updated = {
            ...pricing,
            prices: [...(pricing.prices || []), { label: '', price: 0 }]
        };
        setPricing(updated);
        onChange(updated);
    };

    const removePriceRow = (index: number) => {
        const updated = {
            ...pricing,
            prices: pricing.prices.filter((_, i) => i !== index)
        };
        setPricing(updated);
        onChange(updated);
    };

    const updatePriceRow = (index: number, field: keyof PricingItem, val: any) => {
        const newPrices = [...(pricing.prices || [])];
        newPrices[index] = { ...newPrices[index], [field]: val };
        const updated = { ...pricing, prices: newPrices };
        setPricing(updated);
        onChange(updated);
    };

    return (
        <div className="space-y-4 border rounded-md p-4">
            <div className="flex gap-4">
                <div className="w-1/3">
                    <Label>Currency</Label>
                    <Select
                        value={pricing.currency}
                        onValueChange={(v) => updateField('currency', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-2/3">
                    <Label>Pricing Type</Label>
                    <Select
                        value={pricing.pricing_type}
                        onValueChange={(v) => updateField('pricing_type', v)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed">Fixed Price</SelectItem>
                            <SelectItem value="category_based">Category Based (Age/Group)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Price Categories</Label>
                {pricing.prices?.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                        <div className="flex-1">
                            <Label className="text-xs text-muted-foreground">Label (e.g. Adult)</Label>
                            <Input
                                value={item.label}
                                onChange={(e) => updatePriceRow(idx, 'label', e.target.value)}
                                placeholder="Label"
                            />
                        </div>
                        <div className="w-24">
                            <Label className="text-xs text-muted-foreground">Age (Optional)</Label>
                            <Input
                                value={item.age_range || ''}
                                onChange={(e) => updatePriceRow(idx, 'age_range', e.target.value)}
                                placeholder="e.g. 5-12"
                            />
                        </div>
                        <div className="w-24">
                            <Label className="text-xs text-muted-foreground">Price</Label>
                            <Input
                                type="number"
                                value={item.price}
                                onChange={(e) => updatePriceRow(idx, 'price', Number(e.target.value))}
                                placeholder="0"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive mb-0.5"
                            onClick={() => removePriceRow(idx)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={addPriceRow}
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Price Category
                </Button>
            </div>
        </div>
    );
}
