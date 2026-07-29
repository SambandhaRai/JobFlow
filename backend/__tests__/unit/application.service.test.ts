import mongoose from "mongoose";
import { ApplicationService } from "../../src/services/application.service";
import { ApplicationRepository } from "../../src/repositories/application.repository";
import { JobRepository } from "../../src/repositories/job.repository";

const service = new ApplicationService();
const oid = () => new mongoose.Types.ObjectId();

const applicationInput = (jobId: string) =>
    ({
        jobId,
        resumeUrl: "resume.pdf",
        fullName: "Jane Applicant",
        email: "jane@example.com",
        phone: "9812345678",
    }) as any;

describe("ApplicationService.applyToJob", () => {
    const userId = () => oid().toString();

    it("forbids a non-job-seeker role with 403", async () => {
        await expect(
            service.applyToJob(applicationInput(oid().toString()), userId(), "employer"),
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("rejects a malformed job id with 400", async () => {
        await expect(
            service.applyToJob(applicationInput("not-an-id"), userId(), "user"),
        ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("throws 404 when the job does not exist", async () => {
        jest.spyOn(JobRepository.prototype, "getJobById").mockResolvedValue(null);

        await expect(
            service.applyToJob(applicationInput(oid().toString()), userId(), "user"),
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("blocks applying to an unverified job with 403", async () => {
        jest.spyOn(JobRepository.prototype, "getJobById").mockResolvedValue({
            _id: oid(),
            isVerified: false,
            postedByUserId: oid(),
        } as any);

        await expect(
            service.applyToJob(applicationInput(oid().toString()), userId(), "user"),
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("blocks applying after the deadline has passed with 403", async () => {
        jest.spyOn(JobRepository.prototype, "getJobById").mockResolvedValue({
            _id: oid(),
            isVerified: true,
            deadline: new Date("2000-01-01"),
            postedByUserId: oid(),
        } as any);

        await expect(
            service.applyToJob(applicationInput(oid().toString()), userId(), "user"),
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("rejects a duplicate application with 409", async () => {
        jest.spyOn(JobRepository.prototype, "getJobById").mockResolvedValue({
            _id: oid(),
            isVerified: true,
            postedByUserId: oid(),
        } as any);
        jest.spyOn(ApplicationRepository.prototype, "hasUserAppliedToJob").mockResolvedValue(true);

        await expect(
            service.applyToJob(applicationInput(oid().toString()), userId(), "user"),
        ).rejects.toMatchObject({ statusCode: 409 });
    });

    it("creates the application on the happy path", async () => {
        const posterId = oid();
        jest.spyOn(JobRepository.prototype, "getJobById").mockResolvedValue({
            _id: oid(),
            isVerified: true,
            postedByUserId: posterId,
            companyId: undefined,
        } as any);
        jest.spyOn(ApplicationRepository.prototype, "hasUserAppliedToJob").mockResolvedValue(false);
        const createSpy = jest
            .spyOn(ApplicationRepository.prototype, "createApplication")
            .mockResolvedValue({ _id: oid(), status: "submitted" } as any);

        const jobId = oid().toString();
        const me = userId();
        await service.applyToJob(applicationInput(jobId), me, "user");

        expect(createSpy).toHaveBeenCalledTimes(1);
        const saved = createSpy.mock.calls[0][0] as any;
        // The service stamps the applicant and the job's poster onto the record.
        expect(saved.userId.toString()).toBe(me);
        expect(saved.postedByUserId).toBe(posterId);
    });
});

describe("ApplicationService.withdrawApplication authorization", () => {
    it("forbids withdrawing someone else's application with 403", async () => {
        jest.spyOn(ApplicationRepository.prototype, "getApplicationById").mockResolvedValue({
            _id: oid(),
            userId: oid(), // a different user than the requester
        } as any);

        await expect(
            service.withdrawApplication(oid().toString(), oid().toString(), "user"),
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("lets the owner withdraw their own application", async () => {
        const requesterId = oid();
        jest.spyOn(ApplicationRepository.prototype, "getApplicationById").mockResolvedValue({
            _id: oid(),
            userId: requesterId,
        } as any);
        const deleteSpy = jest
            .spyOn(ApplicationRepository.prototype, "deleteOneApplication")
            .mockResolvedValue(true as any);

        await service.withdrawApplication(oid().toString(), requesterId.toString(), "user");

        expect(deleteSpy).toHaveBeenCalled();
    });
});
