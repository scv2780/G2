<template>
  <div class="container-fluid py-4">
    <!-- 🎞 상단 슬라이드 배너 -->
    <div class="row mb-5">
      <div class="col-12">
        <div
          id="bannerCarousel"
          class="carousel slide shadow-sm rounded-4 overflow-hidden"
          data-bs-ride="carousel"
          data-bs-interval="2000"
        >
          <div class="carousel-inner">
            <!-- 첫 번째 배너 -->
            <div class="carousel-item active">
              <div class="banner-ratio">
                <img src="@/assets/img/banner/1.jpg" alt="이벤트 배너" />
              </div>
            </div>

            <!-- 두 번째 배너 -->
            <div class="carousel-item">
              <div class="banner-ratio">
                <img src="@/assets/img/banner/2.jpg" alt="후원 배너" />
              </div>
            </div>

            <!-- 세 번째 배너 -->
            <div class="carousel-item">
              <div class="banner-ratio">
                <img src="@/assets/img/banner/3.jpg" alt="공지 배너" />
              </div>
            </div>

            <!-- 네 번째 배너 -->
            <div class="carousel-item">
              <div class="banner-ratio">
                <img src="@/assets/img/banner/4.jpg" alt="네 번째 배너" />
              </div>
            </div>
          </div>

          <!-- 좌우 버튼 -->
          <button
            class="carousel-control-prev"
            type="button"
            data-bs-target="#bannerCarousel"
            data-bs-slide="prev"
          >
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>
          <button
            class="carousel-control-next"
            type="button"
            data-bs-target="#bannerCarousel"
            data-bs-slide="next"
          >
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 하단 카드 -->

    <!-- 좌측 -->
    <div class="row align-items-stretch">
      <!-- 신청 현황 -->
      <div class="col-lg-6 col-md-12 mb-4">
        <mini-statistics-card
          title="신청 현황"
          value="7억건"
          icon="assignment"
          color="success"
          description="이번 주 기준 신청 현황"
          class="h-100"
        />
      </div>

      <!-- 우측 -->
      <div class="col-lg-6 col-md-12">
        <div class="row h-100 d-flex flex-column justify-content-between">
          <!-- 이벤트 -->
          <div class="col-12 mb-4 flex-fill">
            <mini-statistics-card
              title="이벤트 참여"
              value="2억명"
              icon="event"
              color="info"
              description="이번 달 등록된 이벤트 수"
              class="h-100"
            />
          </div>

          <!-- 후원 -->
          <div class="col-12 flex-fill">
            <mini-statistics-card
              title="후원 금액"
              value="₩280,000,000,000"
              icon="volunteer_activism"
              color="primary"
              description="총 누적 후원 금액"
              class="h-100"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MiniStatisticsCard from '@/components/MiniStatisticsCard.vue';

export default {
  name: 'Dashboard',
  components: { MiniStatisticsCard },
};
</script>

<style scoped>
.container-fluid {
  min-height: 100vh;
  background-color: #f8f9fa;
}

@media (min-width: 992px) {
  .container-fluid {
    padding: 0 300px;
  }
}

/* ✅ 배너 비율 고정 (aspect-ratio 사용) */
.banner-ratio {
  width: 100%;
  aspect-ratio: 21 / 9;
  border-radius: 16px;
  overflow: hidden;
}

.banner-ratio > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 카드와 배너 간격 */
.row + .row {
  margin-top: 2rem;
}
</style>
