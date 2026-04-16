#!/bin/bash
# Run this in Codespaces after uploading Logo.js to src/components/
# Usage: bash apply-logo.sh

echo "Applying Tabbd logo to all pages..."

# 1. Dashboard layout - sidebar logo
sed -i "s|import { Toast, LootDrop, C } from '@/components/ui';|import { Toast, LootDrop, C } from '@/components/ui';\nimport { TabbdLogo } from '@/components/Logo';|" src/app/dashboard/layout.js
sed -i "s|<div className=\"text-lg font-bold tracking-tight\" style={{ color: C.green }}>TABBD</div>|<TabbdLogo size=\"default\" />|" src/app/dashboard/layout.js

# 2. Landing page - nav logo
sed -i "1s|^|import { TabbdLogo } from '@/components/Logo';\n|" src/app/page.js
sed -i "s|<div className=\"text-xl font-bold tracking-tight\">TABBD</div>|<TabbdLogo size=\"sm\" />|" src/app/page.js

# 3. Login page
sed -i "s|import { createClient } from '@/lib/supabase-browser';|import { createClient } from '@/lib/supabase-browser';\nimport { TabbdLogo } from '@/components/Logo';|" src/app/login/page.js
sed -i "s|<Link href=\"/\" className=\"text-xl font-bold tracking-tight\" style={{ color: C.white }}>TABBD</Link>|<Link href=\"/\"><TabbdLogo size=\"default\" /></Link>|g" src/app/login/page.js

# 4. Signup page
sed -i "s|import { createClient } from '@/lib/supabase-browser';|import { createClient } from '@/lib/supabase-browser';\nimport { TabbdLogo } from '@/components/Logo';|" src/app/signup/page.js
sed -i "s|<Link href=\"/\" className=\"text-xl font-bold tracking-tight\" style={{ color: C.white }}>TABBD</Link>|<Link href=\"/\"><TabbdLogo size=\"default\" /></Link>|g" src/app/signup/page.js

# 5. Join page
sed -i "s|import { createClient } from '@/lib/supabase-browser';|import { createClient } from '@/lib/supabase-browser';\nimport { TabbdLogo } from '@/components/Logo';|" src/app/join/page.js
sed -i "s|<Link href=\"/\" className=\"text-xl font-bold tracking-tight\" style={{ color: C.white }}>TABBD</Link>|<Link href=\"/\"><TabbdLogo size=\"default\" /></Link>|g" src/app/join/page.js

# 6. Reset password page
sed -i "s|import { createClient } from '@/lib/supabase-browser';|import { createClient } from '@/lib/supabase-browser';\nimport { TabbdLogo } from '@/components/Logo';|" src/app/auth/reset-password/page.js
sed -i "s|<Link href=\"/\" className=\"text-xl font-bold tracking-tight\" style={{ color: C.white }}>TABBD</Link>|<Link href=\"/\"><TabbdLogo size=\"default\" /></Link>|g" src/app/auth/reset-password/page.js

echo "Done! Logo applied to all pages."
echo ""
echo "Now run:"
echo "  git add -A"
echo "  git commit -m 'Add Tabbd wordmark logo'"
echo "  git push"
