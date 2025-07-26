<a class="wrapper" href="/editor/{activeLesson?.id ?? '-1'}">
    <div class="content">
        <p class="name">{course.name}</p>
        <div class="details">
            <div class="detail">
                <p class="detail-label">Lehrperson</p>
                <p class="detail-value">...</p>
            </div>
            <div class="detail">
                <p class="detail-label">Lektionen</p>
                <p class="detail-value">12</p>
            </div>
            <div class="detail">
                <p class="detail-label">Fortschritt</p>
                <p class="detail-value">x / y</p>
            </div>
        </div>
    </div>
<!--    <img src="/images/arrow-right.svg" alt="Pfeil nach Rechts" class="icon">-->
    <svg class="icon" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill="white" class="icon-path"
              d="M22 3.70451V18.3074C22 20.7692 20.7572 22 18.2477 22H3.75232C1.25475 22 0 20.7692 0 18.3074V3.70451C0 1.2428 1.25475 0 3.75232 0H18.2477C20.7572 0 22 1.2428 22 3.70451ZM11.472 6.81153C11.472 7.05052 11.5676 7.31342 11.7708 7.48072L13.7545 9.35687L14.5193 10.0739L12.6671 9.99023H5.75992C5.23411 9.99023 4.79197 10.4443 4.79197 10.9821C4.79197 11.5198 5.23411 11.962 5.75992 11.962H12.6671L14.5193 11.8903L13.7545 12.6072L11.7708 14.4834C11.5676 14.6508 11.472 14.9256 11.472 15.1646C11.472 15.6784 11.8305 16.0489 12.3324 16.0489C12.5954 16.0489 12.7985 15.9533 12.9896 15.7621L16.8974 11.6991C17.1483 11.4481 17.2319 11.233 17.2319 10.9821C17.2319 10.7192 17.1483 10.516 16.8974 10.2651L12.9896 6.20207C12.7985 6.01087 12.5954 5.91526 12.3324 5.91526C11.8305 5.91526 11.472 6.29766 11.472 6.81153Z" />
    </svg>

</a>


<script lang="ts">

    import {findFirstLessonInCourse} from '$lib/util'

    let { course }: { course: Course } = $props()

    const activeLesson: Optional<CourseContent> = findFirstLessonInCourse(course)
    console.log('active lesson:', activeLesson)

</script>


<style>

    .wrapper {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        color: var(--text);
        text-decoration: none;
        padding: 12px 16px;
        border-bottom: 2px solid #6B738B;
        transition: background-color 200ms;
    }

    .wrapper:hover {
        background-color: #2b2f3b;
    }

    .icon-path {
        transition: fill 200ms;
    }

    .wrapper:hover .icon-path {
        fill: var(--accent);
    }

    .icon {
        width: 24px;
        margin-bottom: 6px;
    }

    .name {
        font-size: 16px;
        font-weight: 700;
        margin-bottom: 4px;
    }

    .details {
        display: flex;
        font-size: 12px;
        opacity: 0.8;
    }

    .detail {
        margin-right: 16px;
    }

    .detail-value {
        font-weight: 600;
    }

</style>