import mongoose from "mongoose";
import { JobService } from "../../src/services/job.service";
import { JobRepository } from "../../src/repositories/job.repository";
import { CompanyRepository } from "../../src/repositories/company.repository";

const service = new JobService();
const oid = () => new mongoose.Types.ObjectId();

const smallBusinessJob = {
    title: "Backend Developer",
    hiringType: "small-business",
    hiringName: "Acme Studio",
    hiringEmail: "hire@acme.example.com",
    location: "Kathmandu",
    jobType: "full-time",
    workMode: "on-site",
    experienceLevel: "entry-level",
    description: "We are hiring a backend developer.",
} as any;

describe("JobService.createJob", () => {
    it("rejects a malformed employer id with 400", async () => {
        await expect(service.createJob(smallBusinessJob, "not-an-id")).rejects.toMatchObject({
            statusCode: 400,
        });
    });

    it("requires a valid companyId for company-type jobs (400)", async () => {
        const companyJob = { ...smallBusinessJob, hiringType: "company", companyId: undefined };
        await expect(service.createJob(companyJob, oid().toString())).rejects.toMatchObject({
            statusCode: 400,
        });
    });

    it("throws 404 when the referenced company does not exist", async () => {
        jest.spyOn(CompanyRepository.prototype, "getCompanyById").mockResolvedValue(null);
        const companyJob = { ...smallBusinessJob, hiringType: "company", companyId: oid().toString() };

        await expect(service.createJob(companyJob, oid().toString())).rejects.toMatchObject({
            statusCode: 404,
        });
    });

    it("forbids posting for a company the employer is not a member of (403)", async () => {
        jest.spyOn(CompanyRepository.prototype, "getCompanyById").mockResolvedValue({ _id: oid() } as any);
        jest.spyOn(CompanyRepository.prototype, "isCompanyMember").mockResolvedValue(false);
        const companyJob = { ...smallBusinessJob, hiringType: "company", companyId: oid().toString() };

        await expect(service.createJob(companyJob, oid().toString())).rejects.toMatchObject({
            statusCode: 403,
        });
    });

    it("creates a small-business job, defaulting the hiring name onto the record", async () => {
        const createSpy = jest
            .spyOn(JobRepository.prototype, "createJob")
            .mockResolvedValue({ _id: oid(), title: smallBusinessJob.title } as any);

        await service.createJob(smallBusinessJob, oid().toString());

        expect(createSpy).toHaveBeenCalledTimes(1);
        const saved = createSpy.mock.calls[0][0] as any;
        expect(saved.hiringName).toBe("Acme Studio");
        expect(saved.isHiringVerified).toBe(false);
    });
});

describe("JobService.getJobById", () => {
    it("rejects a malformed id with 400", async () => {
        await expect(service.getJobById("not-an-id")).rejects.toMatchObject({ statusCode: 400 });
    });

    it("throws 404 when the job is missing", async () => {
        jest.spyOn(JobRepository.prototype, "getJobByIdWithRelations").mockResolvedValue(null);

        await expect(service.getJobById(oid().toString())).rejects.toMatchObject({ statusCode: 404 });
    });
});

describe("JobService.updateJob authorization", () => {
    it("forbids a non-owner, non-admin from updating (403)", async () => {
        const job = { _id: oid(), postedByUserId: oid(), companyId: undefined };
        jest.spyOn(JobRepository.prototype, "getJobById").mockResolvedValue(job as any);

        await expect(
            service.updateJob(oid().toString(), { title: "New" } as any, oid().toString(), "employer"),
        ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("lets an admin update any job", async () => {
        const jobId = oid().toString();
        jest.spyOn(JobRepository.prototype, "getJobById").mockResolvedValue({
            _id: jobId,
            postedByUserId: oid(),
        } as any);
        const updateSpy = jest
            .spyOn(JobRepository.prototype, "updateOneJob")
            .mockResolvedValue({ _id: jobId, title: "New" } as any);

        const result = await service.updateJob(jobId, { title: "New" } as any, oid().toString(), "admin");

        expect(updateSpy).toHaveBeenCalled();
        expect(result).toMatchObject({ title: "New" });
    });
});
