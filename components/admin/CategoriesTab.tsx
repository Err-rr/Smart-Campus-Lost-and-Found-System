'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { categoryIcon } from '@/components/ui/CategoryIcon';
import { Field, Input } from '@/components/ui/Form';
import { useStore } from '@/lib/store';

export function CategoriesTab() {
  const categories = useStore((s) => s.categories);
  const lostReports = useStore((s) => s.lostReports);
  const foundItems = useStore((s) => s.foundItems);
  const addCategory = useStore((s) => s.addCategory);
  const renameCategory = useStore((s) => s.renameCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);

  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');

  const usage = useMemo(() => {
    const m = new Map<string, number>();
    [...lostReports.map((r) => r.categoryId), ...foundItems.map((f) => f.categoryId)].forEach((id) =>
      m.set(id, (m.get(id) ?? 0) + 1),
    );
    return m;
  }, [lostReports, foundItems]);

  const nameTaken = (name: string, exceptId?: string) =>
    categories.some((c) => c.id !== exceptId && c.name.toLowerCase() === name.toLowerCase());

  const onAdd = (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (name.length < 2) return setAddError('Enter a name, at least 2 characters.');
    if (nameTaken(name)) return setAddError('A category with this name already exists.');
    addCategory(name);
    setNewName('');
    setAddError('');
  };

  const onRename = (id: string) => {
    const name = editName.trim();
    if (name.length < 2) return setEditError('Enter a name, at least 2 characters.');
    if (nameTaken(name, id)) return setEditError('A category with this name already exists.');
    renameCategory(id, name);
    setEditing(null);
    setEditError('');
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <Card>
        <ul className="divide-y divide-divider">
          {categories.map((c) => {
            const Icon = categoryIcon(c.id);
            const used = usage.get(c.id) ?? 0;
            const isEditing = editing === c.id;
            return (
              <li key={c.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tile bg-tile text-ink-icon">
                    <Icon size={18} strokeWidth={1.5} aria-hidden />
                  </span>
                  {isEditing ? (
                    <div className="min-w-0 flex-1">
                      <Input
                        aria-label={`New name for ${c.name}`}
                        value={editName}
                        autoFocus
                        maxLength={40}
                        invalid={!!editError}
                        className="h-10"
                        onChange={(e) => {
                          setEditName(e.target.value);
                          setEditError('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onRename(c.id);
                          if (e.key === 'Escape') setEditing(null);
                        }}
                      />
                      {editError && <p className="mt-1 text-[13px] text-[#A94438]">{editError}</p>}
                    </div>
                  ) : (
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium text-ink">{c.name}</p>
                      <p className="text-[13px] text-ink-2">
                        {used === 0
                          ? 'Not used yet'
                          : `Used by ${used} ${used === 1 ? 'report' : 'reports'}, so it cannot be deleted`}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 gap-2 pl-[52px] sm:pl-0">
                  {isEditing ? (
                    <>
                      <Button variant="secondary" onClick={() => setEditing(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => onRename(c.id)}>Save</Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditing(c.id);
                          setEditName(c.name);
                          setEditError('');
                        }}
                      >
                        Rename
                      </Button>
                      <Button
                        variant="ghost"
                        disabled={used > 0}
                        title={used > 0 ? 'Categories in use cannot be deleted' : undefined}
                        aria-label={used > 0 ? `Delete ${c.name} (not allowed, in use)` : `Delete ${c.name}`}
                        onClick={() => deleteCategory(c.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="text-[16px] font-semibold text-ink">Add a category</h2>
        <form onSubmit={onAdd} noValidate className="mt-4 flex flex-col gap-4">
          <Field id="new-category" label="Name" error={addError}>
            <Input
              id="new-category"
              value={newName}
              maxLength={40}
              invalid={!!addError}
              placeholder="e.g. Sports equipment"
              onChange={(e) => {
                setNewName(e.target.value);
                setAddError('');
              }}
            />
          </Field>
          <Button type="submit">Add category</Button>
        </form>
        <p className="mt-4 border-t border-divider pt-4 text-[13px] text-ink-2">
          A category that any report uses cannot be deleted, so old reports keep their category. Rename it instead.
        </p>
      </Card>
    </div>
  );
}
