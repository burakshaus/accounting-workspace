# Project Memory: Accounting Workspace

## Project Overview
Kişisel muhasebe yönetim uygulaması. İki ana bileşen:
- `accounting-api/` — .NET 8 (C#) ASP.NET Core REST API
- `accounting-mobile/` — React Native / Expo mobil uygulama

## Tech Stack
**Backend:**
- .NET 8, Entity Framework Core 8, PostgreSQL (port 5433, db: muhasebedb)
- JWT Authentication, BCrypt şifre hashing
- Swagger/OpenAPI dokümantasyonu (port 5064)

**Frontend:**
- React Native 0.81.5, Expo Router (file-based routing)
- Zustand (state), TanStack React Query (data fetching), Axios (HTTP)
- AsyncStorage + Expo SecureStore (token saklama)

## Key Architecture
**API Routes:** AuthController, ExpenseController, IncomeController, ReportsController, UsersController
**Models:** User, Income, Expense (userId ile izolasyon)
**Mobile Screens:** (auth)/login, (auth)/register, (tabs)/dashboard, (tabs)/income, (tabs)/expense, (tabs)/reports

## Important Details
- Mobil API adresi: `192.168.0.17:5064` (hardcoded, geliştirme)
- JWT süresi: 7 gün
- Para birimleri: `decimal(18,2)`
- DTOs kullanılıyor (ExpenseCreateDto, ExpenseResponseDto vb.)

## File References
- API entry: `accounting-api/Program.cs`
- API config: `accounting-api/appsettings.json`
- Mobile API client: `accounting-mobile/lib/api.ts`
- Mobile layout: `accounting-mobile/app/_layout.tsx`
