'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Backpack, CheckCircle } from 'lucide-react';
import type { ReadinessData } from '@/types/learning';

interface Props {
  content: { items: string[] };
  onAnswer: (answer: ReadinessData) => void;
  showResult: boolean;
}

export default function ReadinessChecklist({ content, onAnswer, showResult }: Props) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    Object.fromEntries(content.items.map((item) => [item, false])),
  );

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = content.items.length;
  const allChecked = checkedCount === totalCount;

  const handleSubmit = () => {
    const data: ReadinessData = {
      items: content.items.map((name) => ({ name, checked: !!checkedItems[name] })),
    };
    onAnswer(data);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-2 text-center"
      >
        <div className="flex items-center gap-2">
          <Backpack className="h-5 w-5 text-[#4ECDC4]" />
          <p className="text-lg font-medium text-muted-foreground">
            오늘 가져올 것을 확인해요!
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          준비물이 없으면 체크하지 않고 그대로 넘어가도 됩니다.
        </p>
      </motion.div>

      <div className="flex items-center gap-2 text-sm font-medium">
        <div className="h-2.5 w-32 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-[#4ECDC4]"
            animate={{ width: `${(checkedCount / totalCount) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
        </div>
        <span className="text-[#4ECDC4]">
          {checkedCount} / {totalCount}
        </span>
      </div>

      <div className="w-full space-y-2">
        {content.items.map((item, index) => {
          const isChecked = !!checkedItems[item];
          return (
            <motion.button
              key={item}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => !showResult && toggleItem(item)}
              disabled={showResult}
              className={`flex w-full cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all disabled:cursor-default ${
                isChecked
                  ? 'border-[#4ECDC4] bg-[#4ECDC4]/5'
                  : 'border-border hover:border-[#4ECDC4]/40'
              }`}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => !showResult && toggleItem(item)}
                className="h-6 w-6 rounded-lg data-[state=checked]:border-[#4ECDC4] data-[state=checked]:bg-[#4ECDC4]"
                disabled={showResult}
              />
              <span className={`text-lg font-medium transition-all ${
                isChecked ? 'text-[#4ECDC4]' : 'text-foreground'
              }`}>
                {item}
              </span>
              <AnimatePresence>
                {isChecked && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="ml-auto"
                  >
                    <CheckCircle className="h-5 w-5 text-[#4ECDC4]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {!showResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleSubmit}
            className="h-12 rounded-xl bg-[#4ECDC4] px-8 text-lg font-bold hover:bg-[#4ECDC4]/90"
          >
            {checkedCount === 0
              ? '준비물이 없어요'
              : allChecked
                ? '완벽하게 준비됐어요!'
                : '확인 완료!'}
          </Button>
        </motion.div>
      )}

      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 rounded-full border border-[#4ECDC4]/20 bg-[#4ECDC4]/10 px-5 py-2 text-sm font-bold text-[#4ECDC4]"
        >
          {checkedCount === 0
            ? '준비물이 없어요. 다음으로 넘어가요!'
            : allChecked
              ? '모두 챙겼어요! 훌륭해요!'
              : `${checkedCount}개 확인했어요`}
        </motion.div>
      )}
    </div>
  );
}
