import { ClipboardList, Inbox, ScanSearch, ShieldCheck, UserRound, Settings2, HandHelping, FileCheck2 } from 'lucide-react';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { IconTile } from '@/components/ui/IconTile';
import { NoticeBox } from '@/components/ui/NoticeBox';
import { PageHeader } from '@/components/ui/PageHeader';

export const metadata: Metadata = { title: 'About' };

const ROLES = [
  { icon: UserRound, name: 'Campus User', text: 'Students and staff report lost or found items, review matches and claim their belongings.' },
  { icon: Inbox, name: 'Desk Staff', text: 'Log handed-in items, check claims against hidden details and record each handover.' },
  { icon: Settings2, name: 'Administrator', text: 'Watches recovery figures, manages users and categories, and sets the matching rules.' },
];

const STEPS = [
  { icon: ClipboardList, title: 'Report', text: 'Describe the item, where and when. Found items need a photo.' },
  { icon: ScanSearch, title: 'Match', text: 'Each report is scored against the other side on category, place, date and words.' },
  { icon: FileCheck2, title: 'Claim', text: 'The owner describes something only they would know about the item.' },
  { icon: HandHelping, title: 'Verified handover', text: 'The desk compares details, checks the college ID and records the handover.' },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow="About the system"
        title="About"
        description="Smart Campus Lost and Found brings lost reports and found items into one place. Possible matches are found automatically, and items go back only after a verified handover."
      />

      <section aria-labelledby="roles-title">
        <h2 id="roles-title" className="mb-4 text-section text-ink">
          Who uses it
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ROLES.map((r) => (
            <Card key={r.name} className="flex gap-4 p-5">
              <IconTile icon={r.icon} />
              <div>
                <h3 className="text-[16px] font-semibold text-ink">{r.name}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{r.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title" className="mb-4 text-section text-ink">
          How it works
        </h2>
        <Card>
          <ol className="grid grid-cols-1 divide-y divide-divider md:grid-cols-4 md:divide-x md:divide-y-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <IconTile icon={s.icon} />
                  <span className="font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-4 text-[16px] font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{s.text}</p>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <NoticeBox icon={ShieldCheck}>
        <p className="font-semibold">Built as a demo</p>
        <p className="mt-1 text-ink-2">
          Next.js, TypeScript, Tailwind CSS, Zustand, lucide-react and Recharts. There is no server, real sign-in, email or
          SMS. All data is sample data and stays in this browser.
        </p>
      </NoticeBox>

      <Eyebrow>Software Engineering case study, Delhi Technological University</Eyebrow>
    </div>
  );
}
