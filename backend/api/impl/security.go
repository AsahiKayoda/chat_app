package impl

import (
	"context"
	"backend/middleware"
	gen "backend/api/gen"
)

type Security struct{}

// ogenが期待するシグネチャ：opはAPIの操作名、cred.TokenにJWTが入ってる
func (s *Security) HandleBearerAuth(ctx context.Context, op gen.OperationName, cred gen.BearerAuth) (context.Context, error) {
	return middleware.SetUserIDToContextFromJWT(ctx, cred.Token)
}