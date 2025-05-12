package impl

import (
	"context"
	"net/http"

	gen "backend/api/gen"
)

func (h *HandlerImpl) NewError(ctx context.Context, err error) *gen.ErrorStatusCode {
	return &gen.ErrorStatusCode{
		StatusCode: http.StatusInternalServerError,
		Response: gen.Error{
			Message: err.Error(),
		},
	}
}
