import {
  Backpack,
  BookOpen,
  CreditCard,
  KeyRound,
  Package,
  Shirt,
  Smartphone,
  Watch,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  'cat-electronics': Smartphone,
  'cat-books': BookOpen,
  'cat-bags': Backpack,
  'cat-accessories': Watch,
  'cat-cards': CreditCard,
  'cat-clothing': Shirt,
  'cat-keys': KeyRound,
  'cat-others': Package,
};

export function categoryIcon(categoryId: string): LucideIcon {
  return ICONS[categoryId] ?? Package;
}
